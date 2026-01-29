# Invoice Generator

A free, privacy-focused invoice generator that runs entirely in your browser. No data is ever sent to any server.

## 🔒 Privacy & Security

This application is designed with privacy as a core principle:

- **No Backend**: All processing happens in your browser
- **No Data Collection**: We don't collect, store, or transmit any of your data
- **No Cookies**: No tracking cookies or analytics
- **No Account Required**: Use immediately without signing up
- **Local Only**: Your invoice data never leaves your device

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

1. Push this code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click "New Project" and import your repository
4. Click "Deploy" - Vercel auto-detects Vite projects
5. Your site will be live at `your-project.vercel.app`

**Add security headers** by creating `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}
```

### Option 2: Netlify

1. Push to GitHub
2. Go to [netlify.com](https://netlify.com) and connect your repo
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Deploy!

### Option 3: GitHub Pages

1. Add to `vite.config.js`:
   ```js
   export default defineConfig({
     base: '/your-repo-name/',
     plugins: [react()],
   })
   ```
2. Run `npm run build`
3. Push the `dist` folder to a `gh-pages` branch
4. Enable GitHub Pages in your repo settings

### Option 4: Self-Host (Static Files)

1. Run `npm install && npm run build`
2. Upload the `dist` folder to any static hosting (Apache, Nginx, S3, etc.)

## 🛠 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔐 Security Best Practices

When deploying, ensure you:

1. **Use HTTPS**: Always serve over HTTPS (all platforms above do this automatically)
2. **Add Security Headers**: See the vercel.json example above
3. **Keep Dependencies Updated**: Regularly run `npm audit` and update packages
4. **Use a Custom Domain**: Consider using your own domain with SSL

## 📋 Features

- ✅ Create professional invoices
- ✅ Add your business logo
- ✅ Multiple line items
- ✅ Multiple currencies (USD, EUR, GBP, etc.)
- ✅ Payment details section
- ✅ PDF download
- ✅ Live preview
- ✅ Mobile responsive
- ✅ 100% client-side (no server)

## 📄 License

MIT License - feel free to use, modify, and distribute.
