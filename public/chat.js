const noChat = document.getElementById('no-chat');
const chatSection = document.getElementById('chat-section');
const chatsContainer = document.getElementById('chats-container');
const chatPerson = document.getElementById('chat-person');
const chatInfo = document.getElementById('chat-info');
let abortSignal = null;
window.navigation.addEventListener('navigate', function (event) {
  noChat.style.display = 'none';
  chatSection.style.display = 'flex';
  const id = new URL(event.destination.url).hash.slice(1)
  if (!id) {
    noChat.style.display = 'flex';
    chatSection.style.display = 'none';
    return;
  }
  if (current_chat !== id) {
    current_chat = id
    const contact = document.querySelector(`[data-id="${current_chat}"]`)
    const unreadCount = contact.parentElement.querySelector('#unread-count')
    unreadCount.innerText = 0
    unreadCount.classList.add('d-none');
    chatPerson.innerHTML = `<strong>${document.querySelector(`[data-id="${id}"]`).innerHTML}</strong>`;
    chatInfo.style.display = 'flex';
    chatInfo.innerText = 'Loading your chats...';
    if (abortSignal) abortSignal.abort();
    abortSignal = new AbortController();
    fetch(`/v1/chats/list?where_clause[room_id]=${[me.id, current_chat].sort().join('_')}&order=ASC&per_page=1000`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: abortSignal.signal,
    }).then(res => res.json()).then(res => {
      if (res.errors) {
        chatInfo.innerText = `Failed fetch chats due to: ${res.message}`
      } else {
        chatInfo.parentElement.style.display = 'none'
        chatsContainer.querySelectorAll('.chat-item').forEach(elem => elem.remove());
        for (const chat of res.data) {
          const chatDiv = document.createElement('div')
          chatDiv.dataset.id = chat.id;
          chatDiv.classList.add('chat-item');
          chatDiv.style.display = 'flex';
          chatDiv.style.width = '100%'
          chatDiv.innerHTML = `<p class="text-bg-primary p-2 rounded">${chat.message}</p>`
          chatsContainer.appendChild(chatDiv)
          if (chat.created_by === me.id) {
            chatDiv.style.justifyContent = 'flex-end';
          }
          chatsContainer.appendChild(chatDiv)
        }
        chatsContainer.scrollTop = chatsContainer.scrollHeight
      }
    }).catch(err => {
      chatInfo.innerText = `Failed fetch chats due to: ${err.message || err}`
    })
  }
})