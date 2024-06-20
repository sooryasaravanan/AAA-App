import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { initDB, getKey, setKey, getAllKeys, clearDB } from './db'; // Import clearDB function
import './CurrentKeys.css'; // Import the CSS file

const CurrentKeys = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [keys, setKeys] = useState([]);
  const [accessToken, setAccessToken] = useState(null);
  const [db, setDb] = useState(null);

  useEffect(() => {
    const initializeDB = async () => {
      const dbInstance = await initDB();
      setDb(dbInstance);
      
      // Load keys from IndexedDB
      const allKeys = await getAllKeys(dbInstance);
      setKeys(allKeys);
    };
    initializeDB();

    const token = localStorage.getItem('accessToken');
    if (token) {
      setAccessToken(token);
      setIsSignedIn(true);
    }
  }, []);

  const fetchEmails = async (query) => {
    try {
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
    } catch (error) {
      console.error('Error fetching emails:', error);
      return null;
    }
  };

  const processMessage = async (message) => {
    const headers = message.payload.headers;
    const senderHeader = headers.find(header => header.name === 'From');
    const receiverHeader = headers.find(header => header.name === 'To');
    const dateHeader = headers.find(header => header.name === 'Date');

    if (senderHeader && receiverHeader && dateHeader) {
      const sender = senderHeader.value;
      const receiver = receiverHeader.value;
      const time = new Date(dateHeader.value).toISOString();

      const uniquePartner = `${sender} -> ${receiver}`;
      const newKey = `email(${sender}+${receiver}+${time})`;

      const existingKey = await getKey(db, uniquePartner);

      if (existingKey) {
        if (!existingKey.keys.includes(newKey)) {
          existingKey.keys.push(newKey);
          await setKey(db, existingKey);
        }
      } else {
        const newKeyEntry = {
          partner: uniquePartner,
          keys: [newKey],
        };
        await setKey(db, newKeyEntry);
      }

      setKeys(prevKeys => {
        const keyIndex = prevKeys.findIndex(key => key.partner === uniquePartner);
        if (keyIndex > -1) {
          const updatedKeys = [...prevKeys];
          if (!updatedKeys[keyIndex].keys.includes(newKey)) {
            updatedKeys[keyIndex].keys.push(newKey);
          }
          return updatedKeys;
        } else {
          return [...prevKeys, { partner: uniquePartner, keys: [newKey] }];
        }
      });
    } else {
      console.error('Unable to process message: sender, receiver, or date not found.');
    }
  };

  useEffect(() => {
    const fetchLatestEmails = async () => {
      const receivedEmail = await fetchEmails('is:unread');
      if (receivedEmail) processMessage(receivedEmail);

      const sentEmail = await fetchEmails('is:sent');
      if (sentEmail) processMessage(sentEmail);
    };

    if (isSignedIn && accessToken && db) {
      fetchLatestEmails();
      const intervalId = setInterval(fetchLatestEmails, 20000); // Poll every 20 seconds
      return () => clearInterval(intervalId); // Cleanup on unmount
    }
  }, [isSignedIn, accessToken, db]);

  const handleSignOut = () => {
    setIsSignedIn(false);
    setAccessToken(null);
    setKeys([]);
    localStorage.removeItem('accessToken');
    window.location.hash = ''; // Clear the access token from the URL
  };

  const handleResetDB = async () => {
    if (db) {
      await clearDB(db);
      setKeys([]);
    }
  };

  const displayKeys = () => {
    return keys.map(({ partner, keys }) => {
      const [sender, receiver] = partner.split(' -> ');
      return (
        <tr key={partner}>
          <td>{sender}</td>
          <td>{receiver}</td>
          <td>{keys.join(' + ')}</td>
        </tr>
      );
    });
  };

  return (
    <div className="container">
      {isSignedIn ? (
        <>
          <button className="sign-out-button" onClick={handleSignOut}>Sign out</button>
          <button className="reset-db-button" onClick={handleResetDB}>Reset Database</button>
        </>
      ) : (
        <div className="sign-in-message">Please sign in using the login page</div>
      )}
      <table className="keys-table">
        <thead>
          <tr>
            <th>Sender</th>
            <th>Receiver</th>
            <th>Key</th>
          </tr>
        </thead>
        <tbody>
          {displayKeys()}
        </tbody>
      </table>
    </div>
  );
};

export default CurrentKeys;
