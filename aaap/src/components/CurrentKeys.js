import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { initDB, getKey, setKey, getAllKeys, clearDB } from './db';
import { db as firestoreDB } from '../firebase/config';
import './CurrentKeys.css';

const CurrentKeys = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [keys, setKeys] = useState([]);
  const [accessToken, setAccessToken] = useState(null);
  const [db, setDb] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(localStorage.getItem('lastFetchTime') || new Date().toISOString());

  useEffect(() => {
    const initializeDB = async () => {
      const dbInstance = await initDB();
      setDb(dbInstance);
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
          q: query,
        },
      });

      const messages = response.data.messages;
      if (messages && messages.length > 0) {
        for (let i = 0; i < messages.length; i++) {
          const messageId = messages[i].id;
          const messageResponse = await axios.get(`https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          });
          await processMessage(messageResponse.data);
        }
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
    }
  };

  const getUsernameByEmail = async (email) => {
    const q = query(collection(firestoreDB, 'users'), where('gmail', '==', email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return userDoc.data().username;
    }
    return email; // Use email if username is not found
  };

  const processMessage = async (message) => {
    const headers = message.payload.headers;
    const senderHeader = headers.find(header => header.name === 'From');
    const receiverHeader = headers.find(header => header.name === 'To');
    const dateHeader = headers.find(header => header.name === 'Date');

    if (senderHeader && receiverHeader && dateHeader) {
      const senderEmail = senderHeader.value.match(/<([^>]+)>/)[1];
      const receiverEmail = receiverHeader.value.match(/<([^>]+)>/)[1];
      const time = new Date(dateHeader.value).toISOString();

      const senderUsername = await getUsernameByEmail(senderEmail);
      const receiverUsername = await getUsernameByEmail(receiverEmail);

      const uniquePartner1 = `${senderUsername} -> ${receiverUsername}`;
      const uniquePartner2 = `${receiverUsername} -> ${senderUsername}`;
      const newKey = `email(${senderEmail}+${receiverEmail}+${time})`;

      const existingKey1 = await getKey(db, uniquePartner1);
      const existingKey2 = await getKey(db, uniquePartner2);

      if (existingKey1) {
        if (!existingKey1.keys.includes(newKey)) {
          existingKey1.keys.push(newKey);
          await setKey(db, existingKey1);
        }
      } else if (existingKey2) {
        if (!existingKey2.keys.includes(newKey)) {
          existingKey2.keys.push(newKey);
          await setKey(db, existingKey2);
        }
      } else {
        const newKeyEntry = {
          partner: uniquePartner1,
          keys: [newKey],
        };
        await setKey(db, newKeyEntry);
      }

      setKeys(prevKeys => {
        const keyIndex1 = prevKeys.findIndex(key => key.partner === uniquePartner1);
        const keyIndex2 = prevKeys.findIndex(key => key.partner === uniquePartner2);
        if (keyIndex1 > -1) {
          const updatedKeys = [...prevKeys];
          if (!updatedKeys[keyIndex1].keys.includes(newKey)) {
            updatedKeys[keyIndex1].keys.push(newKey);
          }
          return updatedKeys;
        } else if (keyIndex2 > -1) {
          const updatedKeys = [...prevKeys];
          if (!updatedKeys[keyIndex2].keys.includes(newKey)) {
            updatedKeys[keyIndex2].keys.push(newKey);
          }
          return updatedKeys;
        } else {
          return [...prevKeys, { partner: uniquePartner1, keys: [newKey] }];
        }
      });
    } else {
      console.error('Unable to process message: sender, receiver, or date not found.');
    }
  };

  useEffect(() => {
    const fetchLatestEmails = async () => {
      const timestampQuery = `after:${Math.floor(new Date(lastFetchTime).getTime() / 1000)}`;
      await fetchEmails(timestampQuery);
      const currentTime = new Date().toISOString();
      setLastFetchTime(currentTime);
      localStorage.setItem('lastFetchTime', currentTime);
      console.log(`New timestamp set: ${currentTime}`); // Console log the new timestamp
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
    localStorage.removeItem('lastFetchTime');
    window.location.hash = ''; // Clear the access token from the URL
  };

  const handleResetDB = async () => {
    if (db) {
      await clearDB(db);
      setKeys([]);
      localStorage.removeItem('lastFetchTime');
      setLastFetchTime(new Date().toISOString());
    }
  };

  const displayKeys = () => {
    return keys.map(({ partner, keys }) => {
      const [username1, username2] = partner.split(' -> ');
      return (
        <tr key={partner}>
          <td>{username1}</td>
          <td>{username2}</td>
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
            <th>Username 1</th>
            <th>Username 2</th>
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
