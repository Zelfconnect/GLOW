# Contributing to MicroGoal

Thank you for your interest in contributing to MicroGoal! This document provides guidelines and instructions for contributing to the project.

## Development Setup

1. **Fork the Repository**
   - Fork the repository on GitHub
   - Clone your fork locally
   ```bash
   git clone https://github.com/your-username/microgoal.git
   cd microgoal
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Firebase**
   - Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Set up Firebase Authentication and Firestore
   - Update the Firebase configuration in `services/firestore/firebase.js`

4. **Start the Development Server**
   ```bash
   npm start
   ```

5. **Run on Your Device/Emulator**
   - Scan the QR code with the Expo Go app on your device
   - Or press 'a' to run on Android emulator, 'i' for iOS simulator

## Code Style Guidelines

- Follow the existing code style in the project
- Use consistent indentation (2 spaces)
- Use meaningful variable and function names
- Add JSDoc comments for functions and components
- Keep components focused and reusable

## Commit Guidelines

- Use clear, descriptive commit messages
- Start commit messages with a verb in the present tense (e.g., "Add", "Fix", "Update")
- Reference issue numbers in your commits when applicable

## Pull Request Process

1. Create a new branch for your feature or bugfix
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and test thoroughly

3. Commit your changes
   ```bash
   git commit -m "Add your descriptive commit message"
   ```

4. Push to your fork
   ```bash
   git push origin feature/your-feature-name
   ```

5. Open a Pull Request against the `main` branch
   - Provide a clear description of the changes
   - Link any related issues
   - Explain the value the changes provide

6. Address review feedback if requested

## Reporting Bugs

When reporting bugs, please include:
- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior vs. actual behavior
- Screenshots if applicable
- Device/OS/browser information
- Any additional context

## Feature Requests

For feature requests, please include:
- A clear, descriptive title
- Detailed description of the feature
- Why this feature would be valuable to users
- Any implementation ideas you might have

## Code of Conduct

- Be respectful and inclusive
- Focus on the issue, not the person
- Assume good intentions
- Be open to feedback and different perspectives
- Support and help fellow contributors

Thank you for contributing to MicroGoal! 