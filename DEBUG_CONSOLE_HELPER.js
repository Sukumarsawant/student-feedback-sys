// ========================================
// DEBUG CONSOLE HELPER
// ========================================
// Copy and paste this entire script into your browser console
// to monitor all fetch requests and responses
// ========================================

console.log('🔍 DEBUG HELPER LOADED');
console.log('📡 Monitoring all fetch requests...');
console.log('');

// Store original fetch
const originalFetch = window.fetch;

// Override fetch to log all requests
window.fetch = function(...args) {
  const [url, options] = args;
  
  console.group(`📤 FETCH REQUEST: ${url}`);
  console.log('URL:', url);
  console.log('Method:', options?.method || 'GET');
  console.log('Headers:', options?.headers);
  if (options?.body) {
    try {
      console.log('Body:', JSON.parse(options.body));
    } catch {
      console.log('Body (raw):', options.body);
    }
  }
  console.log('Timestamp:', new Date().toISOString());
  console.groupEnd();
  
  // Call original fetch and log response
  return originalFetch.apply(this, args)
    .then(response => {
      console.group(`📥 FETCH RESPONSE: ${url}`);
      console.log('Status:', response.status, response.statusText);
      console.log('Headers:', Object.fromEntries(response.headers.entries()));
      console.log('OK:', response.ok);
      
      // Clone response to read body without consuming it
      return response.clone().text().then(text => {
        try {
          const json = JSON.parse(text);
          console.log('Body (JSON):', json);
        } catch {
          console.log('Body (text):', text.substring(0, 200));
        }
        console.log('Timestamp:', new Date().toISOString());
        console.groupEnd();
        return response;
      });
    })
    .catch(error => {
      console.group(`❌ FETCH ERROR: ${url}`);
      console.error('Error:', error);
      console.log('Timestamp:', new Date().toISOString());
      console.groupEnd();
      throw error;
    });
};

// Also monitor console logs for our custom logging
console.log('');
console.log('✅ Debug helper active!');
console.log('🎯 Look for logs starting with:');
console.log('   🔐 [LOGIN] - Login flow');
console.log('   🚪 [LOGOUT API] - Server-side logout');
console.log('   🚪 [NAVBAR] - Client-side logout');
console.log('   📡 FETCH - All network requests');
console.log('');
console.log('💡 TIP: Try logging out or logging in now to see detailed logs');
console.log('');
