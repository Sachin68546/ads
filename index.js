// server.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const querystring = require('querystring');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const FB_APP_ID = process.env.FB_APP_ID;
const FB_APP_SECRET = process.env.FB_APP_SECRET;
const REDIRECT_URI = 'https://ads-qs9w.onrender.com/auth/callback';

// Redirect to Facebook login
app.get('/login', (req, res) => {
  const url = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${FB_APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=ads_read,business_management&response_type=code&state=123`;
  res.redirect(url);
});

// Callback after Facebook login
app.get('/auth/callback', async (req, res) => {
  const code = req.query.code;

  try {
    const tokenRes = await axios.get(
      `https://graph.facebook.com/v19.0/oauth/access_token?` +
      querystring.stringify({
        client_id: FB_APP_ID,
        redirect_uri: REDIRECT_URI,
        client_secret: FB_APP_SECRET,
        code,
      })
    );

    const accessToken = tokenRes.data.access_token;

    // Redirect to dashboard with no token in URL
    res.sendFile(path.join(__dirname, 'public/set-token.html'));
  } catch (err) {
    console.error('Token Exchange Error:', err.response?.data || err.message);
    res.status(500).send('Authentication failed. Please try again.');
  }
});

// Ads Data API
app.post('/getAdsData', async (req, res) => {
  const { accessToken, accountId } = req.body;

  if (!accessToken || !accountId) {
    return res.status(400).json({ error: 'Access token and account ID are required.' });
  }

  try {
    const result = await axios.get(`https://graph.facebook.com/v19.0/${accountId}/insights`, {
      params: {
        access_token: accessToken,
        fields: ['campaign_name', 'ad_name', 'impressions', 'spend', 'reach'].join(','),
        level: 'ad',
        time_range: JSON.stringify({ since: '2024-06-01', until: '2024-06-15' })
      }
    });

    res.json(result.data);
  } catch (err) {
    console.error('Ad Data Error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch ad data.' });
  }
});

// Privacy Policy Page
app.get('/privacy', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/privacy.html'));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
