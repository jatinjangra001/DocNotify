This is a [Next.js](https://nextjs.org) project created with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

### 🔗 Connect with Me

- **LinkedIn**: [![LinkedIn](https://img.shields.io/badge/-LinkedIn-0A66C2?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/jangrajatin/)
  https://www.linkedin.com/in/jangrajatin/

# [DocNotify](https://docnotify.vercel.app/) - Live Now 🚀

DocNotify is a web application designed to help users manage their important documents and receive timely reminders about their expiration. Built using **Next.js** and deployed on **Vercel**, the project utilizes cron jobs for automated notifications and features secure authentication with **Clerk**.

## ✨ Key Features

- 📄 **Document Management**: Upload and store important documents securely.
- ⏰ **Reminders and Notifications**: Receive automated reminders when documents are nearing expiration.
- 🔐 **User Authentication**: Secure sign-up and login functionality using **Clerk**.
- ✉️ **Email Notifications**: Integrated with **Nodemailer** for email reminders.
- 🎨 **Modern UI**: Built with **React**, **Tailwind CSS**, and **Radix UI** components for a sleek user experience.
- 📱 **Responsive Design**: Optimized for both desktop and mobile devices.
- ⚡ **Deployed on Vercel**: Seamless deployment with continuous integration.
- 🕒 **Cron Jobs**: Schedule tasks and send reminders using Vercel's edge functions and Firebase Functions.

## 🔧 Tech Stack

- **Frontend**: [![Next.js](https://img.shields.io/badge/-Next.js-000?logo=nextdotjs)](https://nextjs.org/), [![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=black)](https://reactjs.org/), [![Tailwind CSS](https://img.shields.io/badge/-TailwindCSS-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
- **Backend**: Firebase, Next.js API routes, Firebase Functions
- **Authentication**: [![Clerk](https://img.shields.io/badge/-Clerk-00BBFF?logo=clerk&logoColor=white)](https://clerk.dev/)
- **Email**: React Email, [![Nodemailer](https://img.shields.io/badge/-Nodemailer-3B3B3B?logo=mail)](https://nodemailer.com/)
- **Database**: Firebase Firestore
- **State Management**: [![TanStack React Query](https://img.shields.io/badge/-TanStack%20React%20Query-FF4154?logo=react&logoColor=white)](https://tanstack.com/query)
- **Date Handling**: [![date-fns](https://img.shields.io/badge/-date--fns-007FFF?logo=date&logoColor=white)](https://date-fns.org/), [![Day.js](https://img.shields.io/badge/-Day.js-FFBB00?logo=javascript&logoColor=black)](https://day.js.org/)

## 🛠️ Installation

To get a local copy up and running, follow these simple steps:

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/jatinjangra001/DocNotify.git
    cd DocNotify
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**

    Create a **`.env.local`** file in the root directory.
    Add the necessary environment variables for Firebase, Clerk, and any other required services.

4.  **Environment Variables:**

    1. **Clerk Configuration:**

    - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key`
    - `CLERK_SECRET_KEY=your_clerk_secret_key`
    - `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
    - `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
    - `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard`
    - `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard`

    2. **SMTP Configuration:**

    - `EMAIL_FROM=your_company_email_address`
    - `EMAIL_HOST=your_email_host`
    - `EMAIL_PORT=your_email_port`
    - `EMAIL_USERNAME=your_email_username`
    - `EMAIL_SECURE=your_email_secure?_true_:_false`
    - `EMAIL_USER=your_email_username`
    - `EMAIL_PASSWORD=your_email_password`

    3. **Firebase Configuration:**

    - `NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key`
    - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain`
    - `NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id`
    - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket`
    - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id`
    - `NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id`

    4. **App URL:**

    - `NODE_ENV=production`
    - `NEXT_PUBLIC_APP_URL=https://your-production-url.com`

    5. **Cron Configuration**

    - `VERCEL_CRON_TOKEN=your_vercel_cron_tokenimport`
    - `CRON_SECRET_KEY=your_cron_secret_key`

    Run the development server:

    ```bash
    npm run dev
    ```

5.  **Deployment**

DocNotify is deployed on Vercel for easy and continuous deployment. The cron jobs for reminders run using Vercel's edge functions and Firebase Functions for backend scheduling.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## 📦 Project Dependencies

1. [Next.js](https://nextjs.org/) - A React Framework for Production
2. [React](https://reactjs.org/) - A JavaScript Library for Building User Interfaces
3. [Tailwind CSS](https://tailwindcss.com/) - A Utility-First CSS Framework
4. [TanStack React Query](https://tanstack.com/query/) - A Library for React Data Fetching
5. [Clerk](https://clerk.dev/) - A User Authentication and Management Platform
6. [Firebase](https://firebase.google.com/) - A Cloud-Based Database and Hosting Platform
7. [Firebase Functions](https://firebase.google.com/docs/functions) - A Cloud-Based Serverless Functions Platform
8. [Nodemailer](https://nodemailer.com/about/) - A Node.js Module for Sending Email
9. [Date-fns](https://date-fns.org/) - A Modern JavaScript Date Utility Library
10. [Day.js](https://day.js.org/) - A Lightweight JavaScript Date Utility Library
11. [React Dropzone](https://react-dropzone.js.org/) - A Library for Creating File Upload Components
12. [React Day Picker](https://react-day-picker.js.org/) - A Date Picker Component for React
13. [Radix UI](https://www.radix-ui.com/) - Accessible and Customizable UI Components
14. [Framer Motion](https://www.framer.com/motion/) - A Library for Animation and Gestures in React
15. [Tabler Icons](https://tabler-icons.io/) - An Open-Source Icon Set
16. [Lucide React](https://lucide.dev/) - A React Component for Lucide Icons
17. [Clsx](https://github.com/lukeed/clsx) - A Utility for Conditionally Joining Class Names
18. [Tailwind Merge](https://www.npmjs.com/package/tailwind-merge) - A Utility for Merging Tailwind CSS Classes
19. [TypeScript](https://www.typescriptlang.org/) - A Strongly Typed Programming Language for JavaScript
20. [ESLint](https://eslint.org/) - A Tool for Identifying and Fixing Problems in JavaScript Code
21. [PostCSS](https://postcss.org/) - A Tool for Transforming CSS with JavaScript
22. [Ts-Node](https://typestrong.org/ts-node/) - TypeScript Execution and REPL for Node.js
23. [React Email](https://react-email.js.org/) - A React Component for Building Email Templates

## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.
