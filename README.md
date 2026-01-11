Plated AI - Your Mindful AI Recipe Generator (Work in Progress)

Overview:
Plated AI is a web app that generates tailored recipes according to user preferences. Users can enter ingredients that they have along with their caloric/dietary preferences and Plated AI
will generate the optimal recipe with step-by-step instructions and nutritional information.

Purpose:
The purpose of this project was to continue building hands-on experience with cloud technologies, full-stack development, and prompt engineering AI models. I have prior experience with 
deploying apps using cloud hosting platforms such as Render, so this time I wanted to deploy an app while employing DevOps principles such as containerization and CI/CD.

Features:
- Tailored recipe generation with AI
- Step-by-step cooking instructions
- Mobile-friendly responsive UI
- Deployed on the cloud

Tech Stack:
- Frontend: React, Bootstrap
- Backend: Flask, OpenAI API
- Database: MongoDB
- Deployment: AWS (ECS,EC2,CloudWatch), Github Actions, Docker

Architecture:
```
User
  │
  │  Inputs ingredients / preferences
  ▼
Frontend
  │
  │  HTTP Request (HTTPS)
  ▼
AWS Application Load Balancer (ALB)
  │
  │  Forwards traffic to target group
  ▼
Backend
  │
  │  Sends ingredients/preferences
  ▼
OpenAI API
  │
  │  Returns generated recipe
  ▼
Backend
  │
  │  Sends recipe
  ▼
Frontend (Displays final recipe)
```

What I Learned:
- Crafting precise AI Prompts
- Creating Deployment Scripts (CI/CD)
- Security rules for network traffic (Application Load Balancer)
- AWS Deployment using ECR and ECS
- Sleek UI Design

In-Progress Development:
- Multi-Agent Model
- Recipe Storage
- User Allergy/Preference Integration


  
