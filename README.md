# Dynamic PDF Template Generator

This project implements a **Dynamic PDF Template Generation module** as part of the hiring assignment.  
The application allows users to define PDF templates dynamically and generate professional-looking PDFs using mapped JSON data.

---

## Live Demo

https://magnificent-kitsune-414bbc.netlify.app

---

## Features

- Create multiple PDF templates:
  - **Salary Template**
  - **Bill Template**
  - **Generic Template**
- Define structured sections:
  - Header
  - Body
  - Footer
- JSON path-based data mapping (e.g. `user.payDetail.total_salary_amount`)
- Default fallback values for missing data
- Field-level alignment:
  - Left
  - Center
  - Right
- Clean and professional PDF output using **jsPDF**
- Fully client-side (no backend required)
- Dummy JSON data used (as explicitly permitted in the assignment)

---

## Tech Stack

- **React** (Vite)
- **JavaScript (ES6)**
- **jsPDF**
- **Custom CSS (UI-focused, no UI libraries)**

---

## How to Run the Project

```bash
npm install
npm run dev
```

Then open your browser at:
```
http://localhost:5173
```

---

## How It Works

### Salary Template
- Selecting a **Salary Template** displays a dropdown of users.
- Selecting a user and clicking **Generate PDF** creates a salary slip-style PDF using mapped JSON data.

### Bill Template
- Selecting a **Bill Template** requires **no additional input**.
- Clicking **Generate PDF** directly generates the bill PDF using predefined bill data.

### Generic Template
- Demonstrates flexibility for other document types.
- Uses sample JSON data for demonstration.

---

## Dummy Data Usage

Dummy JSON data is used to simulate backend responses:
- Salary user data
- Bill invoice data

This approach aligns with the assignment instructions and demonstrates how the template engine can easily be connected to real APIs or databases in a production environment.

---

## Project Structure (Key Files)

```
src/
 ├── App.jsx        # Main application logic
 ├── App.css        # UI styling
 └── main.jsx
```

---

## Sample Output

Sample PDFs are generated directly from the application to demonstrate:
- Template structure
- JSON data mapping
- Alignment handling
- Visual formatting

---

## Author

**Bhumika Khatwani**

---

## Assignment Compliance Summary

✔ Dynamic template creation  
✔ Salary template with user selection  
✔ Bill template with direct PDF generation  
✔ JSON mapping & alignment support  
✔ Dummy data used as allowed  
✔ Clean UI and readable PDFs  

---
