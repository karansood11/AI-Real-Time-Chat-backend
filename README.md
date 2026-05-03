# AI-Real-Time-Chat-backend

This is the backend server for the AI Real-Time Chat project. It is built with Node.js, Express, Socket.IO, and integrates AI and payment services.

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
# or
npm start
```

By default, the backend listens on the port configured in your environment or your server code.

## Project Structure

- `src/index.js` - entry point for the Express server
- `src/routes/ai.js` - AI-related API routes
- `src/routes/payment.js` - payment-related API routes
- `src/classes/SocketManager.js` - Socket.IO manager for real-time chat
- `src/classes/GeminiService.js` - AI service integration
- `src/classes/RazorpayService.js` - payment gateway integration
- `src/classes/UserStore.js` - simple user session/store management

## Learn More

This backend works alongside the frontend in `AI-Real-Time-Chat-frontend` and provides real-time chat, AI responses, and payment handling.

If you want to learn more about the libraries used:

- [Express documentation](https://expressjs.com/)
- [Socket.IO documentation](https://socket.io/docs/)
- [dotenv documentation](https://www.npmjs.com/package/dotenv)
- [Razorpay documentation](https://razorpay.com/docs/)

## Deployment

Deploy the backend to any Node.js-compatible environment. Make sure to set any required environment variables before starting the server.
