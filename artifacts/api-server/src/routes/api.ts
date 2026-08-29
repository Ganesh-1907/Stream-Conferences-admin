import { Router } from 'express';
import { User, Conference, Webinar, Blog, Registration, Abstract } from '../db';
import { logger } from '../lib/logger';

const router = Router();

// Helper to check user context from headers
function getUserContext(req: any) {
  const role = req.headers['x-user-role'] || req.query.role;
  const username = req.headers['x-user-name'] || req.query.username;
  return { role, username };
}

// ----------------------------------------------------
// AUTHENTICATION
// ----------------------------------------------------
router.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    return res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Login error:', error as any);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ----------------------------------------------------
// CONFERENCES
// ----------------------------------------------------
router.get('/conferences', async (req, res) => {
  const { role, username } = getUserContext(req);
  try {
    let query = {};
    if (role === 'mentor' && username) {
      query = { announcedBy: username };
    }
    const list = await Conference.find(query);
    return res.json(list);
  } catch (error) {
    logger.error('Fetch conferences error:', error as any);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/conferences', async (req, res) => {
  const { role, username } = getUserContext(req);
  if (!username) {
    return res.status(401).json({ error: 'Unauthorized username context missing' });
  }
  const { title, description, day, month, location, date } = req.body;
  try {
    const item = await Conference.create({
      title,
      description,
      day,
      month,
      location,
      date,
      announcedBy: username
    });
    return res.status(201).json(item);
  } catch (error) {
    logger.error('Create conference error:', error as any);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/conferences/:id', async (req, res) => {
  const { role, username } = getUserContext(req);
  const { id } = req.params;
  const { title, description, day, month, location, date } = req.body;
  try {
    const item = await Conference.findById(id);
    if (!item) {
      return res.status(404).json({ error: 'Conference not found' });
    }
    if (role === 'mentor' && item.announcedBy !== username) {
      return res.status(403).json({ error: 'Forbidden: Cannot edit another user\'s conference' });
    }

    item.title = title ?? item.title;
    item.description = description ?? item.description;
    item.day = day ?? item.day;
    item.month = month ?? item.month;
    item.location = location ?? item.location;
    item.date = date ?? item.date;

    await item.save();
    return res.json(item);
  } catch (error) {
    logger.error('Update conference error:', error as any);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/conferences/:id', async (req, res) => {
  const { role, username } = getUserContext(req);
  const { id } = req.params;
  try {
    const item = await Conference.findById(id);
    if (!item) {
      return res.status(404).json({ error: 'Conference not found' });
    }
    if (role === 'mentor' && item.announcedBy !== username) {
      return res.status(403).json({ error: 'Forbidden: Cannot delete another user\'s conference' });
    }
    await Conference.findByIdAndDelete(id);
    return res.json({ success: true });
  } catch (error) {
    logger.error('Delete conference error:', error as any);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ----------------------------------------------------
// WEBINARS
// ----------------------------------------------------
router.get('/webinars', async (req, res) => {
  const { role, username } = getUserContext(req);
  try {
    let query = {};
    if (role === 'mentor' && username) {
      query = { announcedBy: username };
    }
    const list = await Webinar.find(query);
    return res.json(list);
  } catch (error) {
    logger.error('Fetch webinars error:', error as any);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/webinars', async (req, res) => {
  const { role, username } = getUserContext(req);
  if (!username) {
    return res.status(401).json({ error: 'Unauthorized username context missing' });
  }
  const { title, description, day, month, location, date, speaker } = req.body;
  try {
    const item = await Webinar.create({
      title,
      description,
      day,
      month,
      location,
      date,
      speaker,
      announcedBy: username
    });
    return res.status(201).json(item);
  } catch (error) {
    logger.error('Create webinar error:', error as any);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/webinars/:id', async (req, res) => {
  const { role, username } = getUserContext(req);
  const { id } = req.params;
  const { title, description, day, month, location, date, speaker } = req.body;
  try {
    const item = await Webinar.findById(id);
    if (!item) {
      return res.status(404).json({ error: 'Webinar not found' });
    }
    if (role === 'mentor' && item.announcedBy !== username) {
      return res.status(403).json({ error: 'Forbidden: Cannot edit another user\'s webinar' });
    }

    item.title = title ?? item.title;
    item.description = description ?? item.description;
    item.day = day ?? item.day;
    item.month = month ?? item.month;
    item.location = location ?? item.location;
    item.date = date ?? item.date;
    item.speaker = speaker ?? item.speaker;

    await item.save();
    return res.json(item);
  } catch (error) {
    logger.error('Update webinar error:', error as any);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/webinars/:id', async (req, res) => {
  const { role, username } = getUserContext(req);
  const { id } = req.params;
  try {
    const item = await Webinar.findById(id);
    if (!item) {
      return res.status(404).json({ error: 'Webinar not found' });
    }
    if (role === 'mentor' && item.announcedBy !== username) {
      return res.status(403).json({ error: 'Forbidden: Cannot delete another user\'s webinar' });
    }
    await Webinar.findByIdAndDelete(id);
    return res.json({ success: true });
  } catch (error) {
    logger.error('Delete webinar error:', error as any);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ----------------------------------------------------
// BLOGS
// ----------------------------------------------------
router.get('/blogs', async (req, res) => {
  const { role, username } = getUserContext(req);
  try {
    let query = {};
    if (role === 'mentor' && username) {
      query = { announcedBy: username };
    }
    const list = await Blog.find(query).sort({ createdAt: -1 });
    return res.json(list);
  } catch (error) {
    logger.error('Fetch blogs error:', error as any);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/blogs', async (req, res) => {
  const { role, username } = getUserContext(req);
  if (!username) {
    return res.status(401).json({ error: 'Unauthorized username context missing' });
  }
  const { title, label, copy, content } = req.body;
  try {
    const item = await Blog.create({
      title,
      label,
      copy,
      content,
      announcedBy: username
    });
    return res.status(201).json(item);
  } catch (error) {
    logger.error('Create blog error:', error as any);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/blogs/:id', async (req, res) => {
  const { role, username } = getUserContext(req);
  const { id } = req.params;
  const { title, label, copy, content } = req.body;
  try {
    const item = await Blog.findById(id);
    if (!item) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    if (role === 'mentor' && item.announcedBy !== username) {
      return res.status(403).json({ error: 'Forbidden: Cannot edit another user\'s blog' });
    }

    item.title = title ?? item.title;
    item.label = label ?? item.label;
    item.copy = copy ?? item.copy;
    item.content = content ?? item.content;

    await item.save();
    return res.json(item);
  } catch (error) {
    logger.error('Update blog error:', error as any);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/blogs/:id', async (req, res) => {
  const { role, username } = getUserContext(req);
  const { id } = req.params;
  try {
    const item = await Blog.findById(id);
    if (!item) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    if (role === 'mentor' && item.announcedBy !== username) {
      return res.status(403).json({ error: 'Forbidden: Cannot delete another user\'s blog' });
    }
    await Blog.findByIdAndDelete(id);
    return res.json({ success: true });
  } catch (error) {
    logger.error('Delete blog error:', error as any);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ----------------------------------------------------
// REGISTRATIONS & ABSTRACT SUBMISSIONS
// ----------------------------------------------------
router.get('/registrations', async (req, res) => {
  const { role } = getUserContext(req);
  if (role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Only administrators can view registrations' });
  }
  try {
    const list = await Registration.find().sort({ createdAt: -1 });
    return res.json(list);
  } catch (error) {
    logger.error('Fetch registrations error:', error as any);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/registrations/register', async (req, res) => {
  const { name, email, phone, institution, country, category, presentingAbstract } = req.body;
  try {
    const item = await Registration.create({
      name,
      email,
      phone,
      institution,
      country,
      category,
      presentingAbstract
    });
    return res.status(201).json(item);
  } catch (error) {
    logger.error('Create registration error:', error as any);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/abstracts', async (req, res) => {
  const { role } = getUserContext(req);
  if (role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Only administrators can view abstracts' });
  }
  try {
    const list = await Abstract.find().sort({ createdAt: -1 });
    return res.json(list);
  } catch (error) {
    logger.error('Fetch abstracts error:', error as any);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/abstracts/submit', async (req, res) => {
  const { name, email, track, summary } = req.body;
  try {
    const item = await Abstract.create({
      name,
      email,
      track,
      summary
    });
    return res.status(201).json(item);
  } catch (error) {
    logger.error('Create abstract submission error:', error as any);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
