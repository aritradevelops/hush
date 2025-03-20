const noChat = document.getElementById('no-chat');
const chatSection = document.getElementById('chat-section');
const chatsContainer = document.getElementById('chats-container');
const chatPerson = document.getElementById('chat-person');
const chatInfo = document.getElementById('chat-info');
let abortSignal = null;
window.navigation.addEventListener('navigate', async function (event) {
  // testEncryption()
  renderCurrentChats(event.destination.url)
})
document.addEventListener("DOMContentLoaded", async (event) => {
  console.log("DOM fully loaded and parsed");
  renderCurrentChats(window.location);
});

async function renderCurrentChats(url) {
  noChat.style.display = 'none';
  chatSection.style.display = 'flex';
  const id = new URL(url).hash.slice(1)
  if (!id) {
    noChat.style.display = 'flex';
    chatSection.style.display = 'none';
    return;
  }
  if (current_chat !== id) {
    try {
      current_chat = id
      let sharedSecret = null;
      let sharedSecretStr = localStorage.getItem(`shared_secret_${current_chat}`)
      if (!sharedSecretStr) {
        const response = await fetch(`/v1/secrets/room/${[me.id, current_chat].sort().join('_')}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        })
        if (!response.ok) {
          return;
        }
        const encryptedSharedSecret = (await response.json()).encrypted_shared_secret;
        console.log(`Received encrypted_shared_secret: ${encryptedSharedSecret}`)
        const privateKey = localStorage.getItem(`${me.email}_hush_private_key`)
        console.log(privateKey)
        const sharedSecretBuffer = await CryptoUtil.decryptSharedKey(Uint8Array.from(atob(encryptedSharedSecret), c => c.charCodeAt(0)), privateKey)
        localStorage.setItem(`shared_secret_${current_chat}`, btoa(String.fromCharCode(...new Uint8Array(sharedSecretBuffer))))
        console.log(`storing shared secret: ${btoa(String.fromCharCode(...new Uint8Array(sharedSecretBuffer)))}`)
        sharedSecret = btoa(String.fromCharCode(...new Uint8Array(sharedSecretBuffer)))
      } else {
        sharedSecret = sharedSecretStr
      }
      const contact = document.querySelector(`[data-id="${current_chat}"]`)
      const unreadCount = contact.parentElement.querySelector('#unread-count')
      unreadCount.innerText = 0
      unreadCount.classList.add('d-none');
      chatPerson.innerHTML = `<strong>${document.querySelector(`[data-id="${id}"]`).innerHTML}</strong>`;
      chatInfo.style.display = 'flex';
      chatInfo.innerText = 'Loading your chats...';
      if (abortSignal) abortSignal.abort();
      abortSignal = new AbortController();
      const res = await fetch(`/v1/chats/list?where_clause[room_id]=${[me.id, current_chat].sort().join('_')}&order=ASC&per_page=1000`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: abortSignal.signal,
      })
      const resJson = await res.json()
      if (resJson.errors) {
        chatInfo.innerText = `Failed fetch chats due to: ${resJson.message}`
      } else {
        chatInfo.parentElement.style.display = 'none'
        chatsContainer.querySelectorAll('.chat-item').forEach(elem => elem.remove());
        for (const chat of resJson.data) {
          try {
            const chatDiv = document.createElement('div')
            chatDiv.dataset.id = chat.id;
            chatDiv.classList.add('chat-item');
            chatDiv.style.display = 'flex';
            chatDiv.style.width = '100%'
            chatDiv.innerHTML = `<p class="text-bg-primary p-2 rounded">${await CryptoUtil.decryptMessage(chat.message, chat.iv, sharedSecret)}</p>`
            chatsContainer.appendChild(chatDiv)
            if (chat.created_by === me.id) {
              chatDiv.style.justifyContent = 'flex-end';
            }
            chatsContainer.appendChild(chatDiv)
          } catch (error) {
            console.error(`Failed to decrypt message: ${error}`)
            continue
          }
        }
        chatsContainer.scrollTop = chatsContainer.scrollHeight
      }
    } catch (error) {
      console.error(`Failed to: ${error.stack}`)
    }
  }
}

// async function testEncryption() {
//   try {
//     const sharedSecret = "tBxsNdDHsGbJyGtboKUO7pg8WiAksjo6HJYo1HG8Sk0="; // 32-byte Base64 AES key

//     const sharedSecretBytes = Uint8Array.from(atob(sharedSecret), c => c.charCodeAt(0));

//     const { encrypted, iv } = await CryptoUtil.encryptMessage("test", sharedSecretBytes);
//     console.log("Encrypted:", encrypted, "IV:", iv);

//     const message = await CryptoUtil.decryptMessage(encrypted, iv, sharedSecret);
//     console.log("Decrypted Message:", message);
//   } catch (error) {
//     console.error("Encryption error:", error);
//   }
// }

