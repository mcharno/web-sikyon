# Troubleshooting: Port 5000 Already in Use

## Quick Fix Options

### Option 1: Kill the Process Using Port 5000 (Recommended)

Run this in your terminal to find and kill the process:

```bash
# Find the process ID using port 5000
lsof -ti:5000

# Kill the process (replace PID with the number from above)
kill -9 $(lsof -ti:5000)
```

Or as a single command:
```bash
kill -9 $(lsof -ti:5000) 2>/dev/null || echo "Port 5000 is free"
```

### Option 2: Change the Backend Port

If you want to use a different port:

1. Edit `backend/.env`:
```bash
PORT=5001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

2. Update frontend proxy in `frontend/package.json`:
```json
{
  "proxy": "http://localhost:5001"
}
```

3. Restart both servers

### Option 3: Use the Built-in Kill Script

Add this to your `package.json` scripts:

```json
"scripts": {
  "kill:port": "kill -9 $(lsof -ti:5000) 2>/dev/null || echo 'Port already free'",
  "dev:clean": "npm run kill:port && npm run dev"
}
```

Then run:
```bash
npm run dev:clean
```

## Common Causes

**macOS AirPlay Receiver:**
- macOS Monterey and later uses port 5000 for AirPlay
- Go to System Preferences → Sharing → Disable "AirPlay Receiver"

**Previous Node Process:**
- You might have stopped the terminal but the process is still running
- Use Option 1 to kill it

**Another Development Server:**
- Check if you have another instance running in a different terminal
- Close all terminals and try again

## Verify Port is Free

```bash
# Check if port 5000 is in use
lsof -i:5000

# If nothing is returned, port is free
```

## Alternative: Use a Different Port by Default

If you frequently have port conflicts, consider using port 5001 or 3001 for backend by default.
