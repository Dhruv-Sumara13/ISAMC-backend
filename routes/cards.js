import express from "express";
import mongoose from "mongoose";
import { DB } from "../models/dbSchema.js";

const router = express.Router();

const fetchSection = async (sectionName) => {
  try {
    const document = await DB.findOne({});
    return document?.[sectionName] || null;
  } catch (error) {
    console.error(`Error fetching ${sectionName}:`, error);
    throw error;
  }
};

router.get("/get-database", async (req, res) => {
  try {
    const data = await DB.findOne({});
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching DB data",
      error: error.message 
    });
  }
});

router.get("/home-mission", async (req, res) => {
  try {
    const missionData = await fetchSection("Mission");
    res.status(200).json({ success: true, data: missionData });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching mission data",
      error: error.message 
    });
  }
});

router.get("/featured-events", async (req, res) => {
  try {
    const data = await fetchSection("Events");
    
    // Ensure data is an array and has proper structure
    const eventsArray = Array.isArray(data) ? data : [];
    
    // Validate and clean event data
    const cleanedEvents = eventsArray.map(event => ({
      _id: event._id,
      title: event.title || 'Untitled Event',
      body: event.body || '',
      date: event.date || '',
      location: event.location || '',
      imageUrl: event.imageUrl || event.img || '',
      // Add any other fields that might be needed
      ...event
    }));
    
    res.status(200).json({ 
      success: true, 
      data: cleanedEvents,
      count: cleanedEvents.length 
    });
  } catch (error) {
    console.error('Featured events fetch error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching featured events",
      error: error.message 
    });
  }
});

// Get individual featured event by ID
router.get("/featured-events/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Requested featured event ID:', id);
    
    const allEvents = await fetchSection("Events");
    
    if (!allEvents || !Array.isArray(allEvents)) {
      console.log('❌ No featured events section found or not array');
      return res.status(404).json({ 
        success: false, 
        message: "No featured events found in database" 
      });
    }
    
    if (allEvents.length === 0) {
      console.log('❌ Featured events array is empty');
      return res.status(404).json({ 
        success: false, 
        message: "No featured events available" 
      });
    }
    
    let event = null;
    let matchMethod = '';
    
    // Strategy 1: Exact _id match
    event = allEvents.find(e => String(e._id) === String(id));
    if (event) {
      matchMethod = '_id exact match';
    }
    
    // Strategy 2: Exact id match
    if (!event) {
      event = allEvents.find(e => String(e.id) === String(id));
      if (event) {
        matchMethod = 'id exact match';
      }
    }
    
    // Strategy 3: Array index match
    if (!event && !isNaN(id)) {
      const index = parseInt(id);
      console.log(`Trying array index ${index} (array length: ${allEvents.length})`);
      if (index >= 0 && index < allEvents.length) {
        event = allEvents[index];
        matchMethod = `array index match [${index}]`;
        console.log(`✅ Found by array index [${index}]: ${event.title}`);
      } else {
        console.log(`❌ Index ${index} out of bounds (0-${allEvents.length - 1})`);
      }
    }
    
    // Strategy 4: ObjectId string match (MongoDB)
    if (!event) {
      event = allEvents.find(e => {
        if (e._id && typeof e._id === 'object' && e._id.toString) {
          return e._id.toString() === id;
        }
        return false;
      });
      if (event) {
        matchMethod = 'ObjectId string match';
      }
    }
    
    if (!event) {
      console.log('❌ Featured event not found with any strategy');
      const eventIds = allEvents.map((event, index) => ({
        index,
        _id: event._id,
        id: event.id,
        title: event.title?.slice(0, 30) || 'No title'
      }));
      
      return res.status(404).json({ 
        success: false, 
        message: "Featured event not found",
        debug: {
          requestedId: id,
          requestedIdType: typeof id,
          availableIds: eventIds,
          totalEvents: allEvents.length,
          searchStrategies: [
            '_id exact match',
            'id exact match', 
            'array index match',
            'ObjectId string match'
          ]
        }
      });
    }
    
    console.log(`✅ Featured event found using: ${matchMethod}`);
    console.log(`Event title: ${event.title}`);
    
    res.status(200).json({ success: true, data: event });
    
  } catch (error) {
    console.error('❌ Error in featured-events/:id route:', error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching featured event details",
      error: error.message 
    });
  }
});

router.get("/member-benefits", async (req, res) => {
  try {
    const data = await fetchSection("Member");
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching member benefits",
      error: error.message 
    });
  }
});

router.get("/publications", async (req, res) => {
  try {
    const data = await fetchSection("Publications");
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching publications",
      error: error.message 
    });
  }
});

router.get("/partners", async (req, res) => {
  try {
    const data = await fetchSection("partners");
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching partners",
      error: error.message 
    });
  }
});

router.get("/latest-news", async (req, res) => {
  try {
    const data = await fetchSection("News");
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching partners",
      error: error.message 
    });
  }
});

router.get("/vision", async (req, res) => {
  try {
    const data = await fetchSection("aboutMission");
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching partners",
      error: error.message 
    });
  }
});

router.get("/leadership", async (req, res) => {
  try {
    const data = await fetchSection("leadership");
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching leadership",
      error: error.message 
    });
  }
});

router.get("/member-tiers", async (req, res) => {
  try {
    const data = await fetchSection("tier");
    console.log('Member tiers data fetched successfully');
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error fetching member tiers:', error.message);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching member tiers",
      error: error.message 
    });
  }
});

router.get("/testimonials", async (req, res) => {
  try {
    const data = await fetchSection("Testimonials");
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching testimonials",
      error: error.message 
    });
  }
});

router.get("/upcoming-events", async (req, res) => {
  try {
    const data = await fetchSection("upevents");
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching upcoming events",
      error: error.message 
    });
  }
});

// Get individual upcoming event by ID (requires authentication)
router.get("/upcoming-events/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log('=== UPCOMING EVENT DETAIL REQUEST ===');
    console.log('Requested ID:', id);
    console.log('ID type:', typeof id);
    
    const allEvents = await fetchSection("upevents");
    
    // Enhanced debug logging
    console.log('Raw events data type:', typeof allEvents);
    console.log('Is events array:', Array.isArray(allEvents));
    console.log('Events length:', allEvents ? allEvents.length : 'N/A');
    
    if (!allEvents) {
      console.log('❌ No events section found');
      return res.status(404).json({ 
        success: false, 
        message: "No events section found in database" 
      });
    }
    
    if (!Array.isArray(allEvents)) {
      console.log('❌ Events data is not array:', typeof allEvents);
      return res.status(404).json({ 
        success: false, 
        message: "Events data is not in array format",
        debug: { type: typeof allEvents, data: allEvents }
      });
    }
    
    if (allEvents.length === 0) {
      console.log('❌ Events array is empty');
      return res.status(404).json({ 
        success: false, 
        message: "No events found in array" 
      });
    }
    
    // Enhanced event ID logging
    console.log('\n=== AVAILABLE EVENTS ===');
    const eventIds = allEvents.map((event, index) => {
      const eventInfo = {
        index,
        _id: event._id,
        id: event.id,
        title: event.title || 'No title',
        _idType: typeof event._id,
        idType: typeof event.id
      };
      console.log(`Event ${index}:`, eventInfo);
      return eventInfo;
    });
    
    // Multiple ID matching strategies
    console.log('\n=== SEARCHING FOR EVENT ===');
    console.log('Looking for ID:', id);
    
    let event = null;
    let matchMethod = null;
    
    // Strategy 1: Exact _id match
    event = allEvents.find(e => String(e._id) === String(id));
    if (event) {
      matchMethod = '_id exact match';
      console.log('✅ Found by _id exact match');
    }
    
    // Strategy 2: Exact id match
    if (!event) {
      event = allEvents.find(e => String(e.id) === String(id));
      if (event) {
        matchMethod = 'id exact match';
        console.log('✅ Found by id exact match');
      }
    }
    
    // Strategy 3: Array index match (0-based)
    if (!event && !isNaN(id)) {
      const index = parseInt(id);
      console.log(`Trying array index ${index} (array length: ${allEvents.length})`);
      if (index >= 0 && index < allEvents.length) {
        event = allEvents[index];
        matchMethod = `array index match [${index}]`;
        console.log(`✅ Found by array index [${index}]: ${event.title}`);
      } else {
        console.log(`❌ Index ${index} out of bounds (0-${allEvents.length - 1})`);
      }
    }
    
    // Strategy 4: ObjectId string match (MongoDB)
    if (!event) {
      event = allEvents.find(e => {
        if (e._id && typeof e._id === 'object' && e._id.toString) {
          return e._id.toString() === id;
        }
        return false;
      });
      if (event) {
        matchMethod = 'ObjectId toString match';
        console.log('✅ Found by ObjectId toString');
      }
    }
    
    // Strategy 5: Content-based ID match (for generated IDs)
    if (!event && id.includes('-')) {
      const [titlePart] = id.split('-');
      const decodedTitle = decodeURIComponent(titlePart);
      console.log(`Trying content-based match with title: "${decodedTitle}"`);
      
      event = allEvents.find(e => {
        const eventTitle = e.title?.slice(0, 20) || 'event';
        return eventTitle.toLowerCase().includes(decodedTitle.toLowerCase()) ||
               decodedTitle.toLowerCase().includes(eventTitle.toLowerCase());
      });
      
      if (event) {
        matchMethod = 'content-based ID match';
        console.log('✅ Found by content-based match');
      }
    }
    
    // Strategy 6: Partial match (last resort)
    if (!event) {
      event = allEvents.find(e => {
        const eId = String(e._id || e.id || '');
        return eId.includes(id) || id.includes(eId);
      });
      if (event) {
        matchMethod = 'partial match';
        console.log('✅ Found by partial match');
      }
    }
    
    if (!event) {
      console.log('❌ Event not found with any strategy');
      return res.status(404).json({ 
        success: false, 
        message: "Event not found",
        debug: {
          requestedId: id,
          requestedIdType: typeof id,
          availableIds: eventIds,
          totalEvents: allEvents.length,
          searchStrategies: [
            '_id exact match',
            'id exact match', 
            'array index match',
            'ObjectId toString match',
            'partial match'
          ]
        }
      });
    }
    
    console.log('✅ Event found:', event.title || 'Untitled Event');
    console.log('Match method:', matchMethod);
    console.log('=== SUCCESS ===\n');
    
    res.status(200).json({ success: true, data: event });
    
  } catch (error) {
    console.error('❌ Error in upcoming-events/:id route:', error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching upcoming event",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.get("/past-events", async (req, res) => {
  try {
    const data = await fetchSection("pastEvents");
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching ",
      error: error.message 
    });
  }
});

router.get("/features-benefits", async (req, res) => {
  try {
    const data = await fetchSection("features");
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching ",
      error: error.message 
    });
  }
});

router.get("/events-archives", async (req, res) => {
  try {
    const data = await fetchSection("eventsArchives");
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching ",
      error: error.message 
    });
  }
});

router.get("/generals", async (req, res) => {
  try {
    const data = await fetchSection("generals");
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching generals",
      error: error.message 
    });
  }
});

router.get("/equipment", async (req, res) => {
  try {
    const data = await fetchSection("equipment");
    res.status(200).json({ success: true, data: data || [] });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching equipment",
      error: error.message 
    });
  }
});

router.get("/case-studies", async (req, res) => {
  try {
    const data = await fetchSection("caseStudy");
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching case studies",
      error: error.message 
    });
  }
});

router.get("/resources", async (req, res) => {
  try {
    const data = await fetchSection("resourceCards");
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching ",
      error: error.message 
    });
  }
});

router.get("/blogs", async (req, res) => {
  try {
    const data = await fetchSection("blogs");
    res.status(200).json({ success: true, data: data || [] });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching blogs",
      error: error.message 
    });
  }
});

router.get("/case-studies", async (req, res) => {
  try {
    const data = await fetchSection("caseStudy");
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error fetching ",
      error: error.message 
    });
  }
});

router.get('/other-events', async (req, res) => {
  try {
    const data = await fetchSection('otherEvents');
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch other AM events.' });
  }
});

// Get individual other event by ID (requires authentication)
router.get('/other-events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('=== OTHER EVENT DETAIL REQUEST ===');
    console.log('Requested ID:', id);
    
    const allEvents = await fetchSection('otherEvents');
    
    if (!allEvents || !Array.isArray(allEvents)) {
      return res.status(404).json({ 
        success: false, 
        message: "Other events not found in database" 
      });
    }
    
    // Find event using multiple strategies
    let event = allEvents.find(e => String(e._id) === String(id) || String(e.id) === String(id));
    
    if (!event && !isNaN(id)) {
      const index = parseInt(id);
      if (index >= 0 && index < allEvents.length) {
        event = allEvents[index];
      }
    }
    
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: "Other event not found"
      });
    }
    
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    console.error('Error in other-events/:id route:', error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching other event",
      error: error.message 
    });
  }
});

// Get individual past event by ID (requires authentication)
router.get('/past-events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('=== PAST EVENT DETAIL REQUEST ===');
    console.log('Requested ID:', id);
    
    const allEvents = await fetchSection('pastEvents');
    
    if (!allEvents || !Array.isArray(allEvents)) {
      return res.status(404).json({ 
        success: false, 
        message: "Past events not found in database" 
      });
    }
    
    // Find event using multiple strategies
    let event = allEvents.find(e => String(e._id) === String(id) || String(e.id) === String(id));
    
    if (!event && !isNaN(id)) {
      const index = parseInt(id);
      if (index >= 0 && index < allEvents.length) {
        event = allEvents[index];
      }
    }
    
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: "Past event not found"
      });
    }
    
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    console.error('Error in past-events/:id route:', error);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching past event",
      error: error.message 
    });
  }
});

export default router;
