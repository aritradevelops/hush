import { ChatEvents } from "../events/chat.events";
import socketManager from "./web-socket-manager";

// Initialize event handlers
const chatEvents = new ChatEvents(socketManager);
chatEvents.registerHandlers();

// Add more event handlers here as needed
// const contactEvents = new ContactEvents(socketManager);
// contactEvents.registerHandlers();
// 
// const groupEvents = new GroupEvents(socketManager);
// groupEvents.registerHandlers(); 