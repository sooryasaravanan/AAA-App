import axios from 'axios';

const CLIENT_ID = '117741247416-gs538g9dt30qk98cbp2t64oac5i7g5u9.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'YOUR_REDIRECT_URI'; // Update this to your redirect URI
const REFRESH_TOKEN = 'YOUR_REFRESH_TOKEN'; // Replace with your actual refresh token

const getAccessToken = async () => {
  const params = new URLSearchParams();
  params.append('client_id', CLIENT_ID);
  params.append('client_secret', CLIENT_SECRET);
  params.append('refresh_token', REFRESH_TOKEN);
  params.append('grant_type', 'refresh_token');

  const response = await axios.post('https://oauth2.googleapis.com/token', params);
  return response.data.access_token;
};

export const fetchEmails = async (query) => {
  const accessToken = await getAccessToken();

  const response = await axios.get('https://www.googleapis.com/gmail/v1/users/me/messages', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    params: {
      maxResults: 1,
      q: query,
    },
  });

  const messages = response.data.messages;

  if (messages && messages.length > 0) {
    const messageId = messages[0].id;
    const messageResponse = await axios.get(`https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    return messageResponse.data;
  } else {
    return null;
  }
};
