# 🚗 Dasher Stats

**Author:** Noah Greski  
**Date:** April 2024  
Independent Learning Assignment – *Software Engineering II*

Dasher Stats is a web application that helps DoorDash delivery drivers (“dashers”) track their delivery stats, analyze performance, and maximize profits.  
The application extracts data from screenshots of DoorDash orders and visualizes earnings, delivery times, and mileage to give drivers useful insights.

---

## 🌐 Live Demo
- **Web App (Firebase Hosted):** [https://doordash-stats.web.app/](https://doordash-stats.web.app/)  
- **GitHub Repository:** [https://github.com/NGreski/doordash-stats.git](https://github.com/NGreski/doordash-stats.git)  

---

## 🎥 Presentations & Demos
- **Project Presentation (Video):** [YouTube](https://youtu.be/5GxrGfca3iU)  
- **Slides:** [Google Slides](https://docs.google.com/presentation/d/1m7Xg__KqIE54JUHW514aN789HwEMYKGsPpyKZrBTraM/edit?usp=sharing)  
- **Web App Walkthrough Demo:** [YouTube](https://youtu.be/-Uno6HoR1ww)  
- **How to Use in Real Life (Demo):** [YouTube](https://youtu.be/pOFE8OGLAjU)  
- **Technical Demo:** [YouTube](https://youtu.be/6OcyNtA1tyg)  

---

## 📖 Overview

Dasher Stats works as an extension of the official Dasher App. While the official app shows only limited stats, Dasher Stats provides deeper insights such as:

- Dollars per hour  
- Miles driven  
- Total profit (with and without cost deduction)  
- Expected vs. actual delivery times  
- Rolling averages of pay rates  
- Money earned per mile  

### How It Works
1. Take **two screenshots**:
   - Before accepting an order (shows time, miles, pay, and delivery-by time).
   - After completing the order (shows time).
2. Upload these screenshots into the web app.  
3. The app extracts values using **OCR (Tesseract.js)**.  
4. Stats are saved in **Firebase Firestore**.  
5. Visualizations are created with **Recharts** and displayed in the dashboard.  

---

## 🛠️ Tech Stack

- **Frontend:** [React](https://react.dev/)  
- **OCR:** [Tesseract.js](https://github.com/naptha/tesseract.js)  
- **Database & Hosting:** [Firebase Firestore](https://firebase.google.com/docs/firestore) + Firebase Hosting  
- **Analytics:** Firebase Analytics  
- **Styling:** [Bootstrap](https://getbootstrap.com/)  
- **Charts & Graphs:** [Recharts](https://recharts.org/)  
- **Version Control:** GitHub  
- **Editor:** Visual Studio Code  

---

## 📊 Features

- **Delivery Data Storage** – Collects pay, mileage, and times.  
- **Dashboard Summaries** – See totals and averages (earnings, miles, hours).  
- **Expected vs. Actual Time Chart** – Visualize delivery speed performance.  
- **Rolling Average Earnings** – Track trends over multiple deliveries.  
- **Money per Mile Analysis** – Identify profitable vs. unprofitable deliveries.  

---

## 🚧 Limitations

1. **Tips Not Tracked** – Tips often appear after delivery and aren’t included.  
2. **Manual Screenshots** – Requires two screenshots per delivery.  
3. **OCR Accuracy** – Dependent on screenshot clarity.  
4. **Screen-Dependent** – If DoorDash changes layout, updates are needed.  
5. **No Real-Time Sync** – Cannot connect directly to DoorDash account.  

---

## 🔮 Future Work

- Add **location data** to identify profitable areas.  
- Include **tip tracking** for complete earnings insight.  
- Connect **directly to DoorDash API** (if accessible).  
- Build a **mobile app** for easier screenshot uploads.  
- Expand to **other delivery apps** (Uber Eats, Grubhub, etc.).  
- Add **AI-based recommendations & alerts** for drivers.  

---

## 📈 Results & Insights

Using Dasher Stats, drivers can answer questions like:
- Do longer drives make more money?  
- How much am I really making per hour?  
- Am I delivering faster than expected?  

This project was inspired in part by data analysis done by **Tyler Greene**, who found:
- More miles generally → slightly more money.  
- Longer delivery times generally → slightly less money.  
- Most drivers tend to earn around the same hourly rate overall.  

Dasher Stats makes it much easier to collect this type of data for future experiments.

---

## 🙏 Acknowledgments

- **Tyler Greene** – Data analysis inspiration.  
- **Luke Tkaczyk** – Introduced me to DoorDash.  
- **Dr. Cotler & Professor Chaudhari** – Academic guidance.  
- **DoorDash** – For the platform and data source.  

---

## 📜 License
This project is for educational and personal use. No affiliation with DoorDash.  
