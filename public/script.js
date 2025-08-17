document.addEventListener('DOMContentLoaded', () => {
  const chatForm = document.getElementById('chat-form');
  const userInput = document.getElementById('user-input');
  const chatBox = document.getElementById('chat-box');
  const submitButton = chatForm.querySelector('button[type="submit"]');

  let conversationHistory = [];

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const userMessage = userInput.value.trim();
    if (!userMessage) {
      return;
    }
    
    // Disable form while waiting for response
    userInput.disabled = true;
    submitButton.disabled = true;

    appendMessage('user', userMessage);
    conversationHistory.push({ role: 'user', content: userMessage });
    userInput.value = '';

    const thinkingMessage = appendMessage('model', 'Thinking...');
    thinkingMessage.classList.add('thinking'); // Add thinking animation class

    try {
      const response = await fetch('/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: conversationHistory,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from server.');
      }

      const data = await response.json();
      const botResponse = data.response || 'Sorry, no response received.';

      thinkingMessage.classList.remove('thinking'); // Remove animation
      thinkingMessage.textContent = botResponse;
      
      conversationHistory.push({ role: 'model', content: botResponse });

    } catch (error) {
      console.error('Error:', error);
      const errorMessage = 'Failed to get response from the server. Please try again.';
      thinkingMessage.classList.remove('thinking');
      thinkingMessage.textContent = errorMessage;
      conversationHistory.push({ role: 'model', content: errorMessage });
    } finally {
        // Re-enable form
        userInput.disabled = false;
        submitButton.disabled = false;
        userInput.focus();
    }
  });

  function appendMessage(role, content) {
    const messageWrapper = document.createElement('div');
    messageWrapper.style.display = 'flex';
    messageWrapper.style.justifyContent = role === 'user' ? 'flex-end' : 'flex-start';

    const messageElement = document.createElement('div');
    messageElement.classList.add('message', role);
    messageElement.textContent = content;
    
    messageWrapper.appendChild(messageElement);
    chatBox.appendChild(messageWrapper);
    chatBox.scrollTop = chatBox.scrollHeight;
    return messageElement;
  }
});