const socket = io();
const chatMsg = document.getElementById('chat-msg')
const chatButton = document.getElementById('chat-btn')
chatMsg.addEventListener('input', () => chatMsg.classList.remove('is-invalid'));
chatMsg.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    chatButton.click();
  }
})
class Message {
  constructor(message, room_id, from_id) {
    this.message = message;
    this.room_id = room_id;
    this.from_id = from_id;
  }
}

chatButton.addEventListener('click', function (e) {
  e.preventDefault();
  const message = chatMsg.value.trim();
  if (!message) {
    chatMsg.classList.add('is-invalid');
    return;
  }
  socket.emit('message', new Message(message, [me.id, current_chat].sort().join('_'), me.id));
  const chatDiv = document.createElement('div')
  chatDiv.style.display = 'flex';
  chatDiv.style.width = '100%'
  chatDiv.style.justifyContent = 'flex-end';
  chatDiv.innerHTML = `<p class="text-bg-primary p-2 rounded">${message}</p>`
  chatsContainer.appendChild(chatDiv)
  chatMsg.value = '';
  chatsContainer.scrollTop = chatsContainer.scrollHeight
})


socket.on('connect', () => {
  for (const contact of me.contacts) {
    socket.emit('join', [me.id, contact.id].sort().join('_'));
  }
})

socket.on('private-message', (msg) => {
  if (msg.from_id === current_chat) {
    const chatDiv = document.createElement('div')
    chatDiv.style.display = 'flex';
    chatDiv.style.width = '100%'
    chatDiv.innerHTML = `<p class="text-bg-primary p-2 rounded">${msg.message}</p>`
    chatsContainer.appendChild(chatDiv)
    chatsContainer.scrollTop = chatsContainer.scrollHeight
  } else {
    const contact = document.querySelector(`[data-id="${msg.from_id}"]`)
    const unreadCount = contact.parentElement.querySelector('#unread-count')
    if (unreadCount.classList.contains('d-none')) {
      unreadCount.classList.remove('d-none')
    }
    unreadCount.innerText = parseInt(unreadCount.innerText) + 1
  }
})
