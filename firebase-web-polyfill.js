// This handles certain Firebase modules that might not work properly in web
if (typeof window !== 'undefined') {
  window.process = {
    ...window.process,
    env: {
      ...window.process?.env,
      NODE_ENV: process.env.NODE_ENV || 'development'
    }
  };
} 