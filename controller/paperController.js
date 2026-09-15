import sendCpanelEmail from '../utils/cpanelEmail.js';
import googleDriveService from '../config/googleDrive.js';
import Paper from '../models/paperModel.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const submitPaper = async (req, res) => {
  let tempFilePath = null;
  
  try {
    const { name, email, title } = req.body;
    const file = req.file;
    
    if (!name || !email || !title || !file) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required.' 
      });
    }

    // Validate file type
    if (file.mimetype !== 'application/pdf') {
      return res.status(400).json({
        success: false,
        message: 'Only PDF files are allowed.'
      });
    }

    // Create temp file for Google Drive upload
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    tempFilePath = path.join(tempDir, `${Date.now()}-${file.originalname}`);
    fs.writeFileSync(tempFilePath, file.buffer);

    // Upload to Google Drive
    const googleDriveUrl = await googleDriveService.uploadPDF(tempFilePath, file.originalname);
    const fileId = googleDriveUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)[1];

    // Save to database
    const paper = new Paper({
      name,
      email,
      title,
      fileName: file.originalname,
      fileSize: file.size,
      googleDriveUrl,
      googleDriveFileId: fileId
    });

    await paper.save();

    // Send email notification
    const mailOptions = {
      to: process.env.CONTACT_EMAIL || process.env.CPANEL_EMAIL_USER,
      subject: `New Paper Submission: ${title}`,
      html: `
        <h3>New Paper Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Title:</strong> ${title}</p>
        <p><strong>File:</strong> ${file.originalname} (${(file.size / 1024).toFixed(2)} KB)</p>
        <p><strong>Google Drive Link:</strong> <a href="${googleDriveUrl}" target="_blank">View PDF</a></p>
        <p><strong>Submission ID:</strong> ${paper._id}</p>
      `
    };

    let emailSent = true;
    try {
      await sendCpanelEmail({ ...mailOptions, replyTo: email });
    } catch (emailError) {
      emailSent = false;
      console.error('Paper saved but notification email failed:', emailError.message);
    }
    
    res.status(emailSent ? 200 : 202).json({ 
      success: true, 
      message: emailSent
        ? 'Paper submitted successfully!'
        : 'Paper submitted successfully. Email notification is temporarily delayed.',
      submissionId: paper._id,
      emailSent,
    });
    
  } catch (err) {
    console.error('Paper submission error:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message || 'Failed to submit paper.' 
    });
  } finally {
    // Clean up temp file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  }
};

export const getPapers = async (req, res) => {
  try {
    const papers = await Paper.find().sort({ submittedAt: -1 });
    res.status(200).json({ success: true, papers });
  } catch (err) {
    console.error('Get papers error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch papers.' 
    });
  }
};

export const updatePaperStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const paper = await Paper.findByIdAndUpdate(
      id, 
      { status }, 
      { new: true }
    );
    
    if (!paper) {
      return res.status(404).json({ 
        success: false, 
        message: 'Paper not found.' 
      });
    }
    
    res.status(200).json({ success: true, paper });
  } catch (err) {
    console.error('Update paper status error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update paper status.' 
    });
  }
};

export const deletePaper = async (req, res) => {
  try {
    const { id } = req.params;
    
    const paper = await Paper.findById(id);
    if (!paper) {
      return res.status(404).json({ 
        success: false, 
        message: 'Paper not found.' 
      });
    }
    
    // Delete from Google Drive
    await googleDriveService.deletePDF(paper.googleDriveFileId);
    
    // Delete from database
    await Paper.findByIdAndDelete(id);
    
    res.status(200).json({ 
      success: true, 
      message: 'Paper deleted successfully.' 
    });
  } catch (err) {
    console.error('Delete paper error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete paper.' 
    });
  }
};
