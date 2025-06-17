const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/getAdsData', async (req, res) => {
  const { accessToken, accountId } = req.body;

  try {
    const fields = ['campaign_name', 'ad_name', 'impressions', 'spend', 'reach'];
    const result = await axios.get(`https://graph.facebook.com/v19.0/${accountId}/insights`, {
      params: {
        access_token: accessToken,
        fields: fields.join(','),
        level: 'ad',
        time_range: JSON.stringify({ since: '2024-06-01', until: '2024-06-15' })
      }
    });

    res.json(result.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch ad data' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
