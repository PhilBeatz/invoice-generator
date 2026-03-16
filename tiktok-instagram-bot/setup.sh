#!/bin/bash
# Setup script for TikTok to Instagram Bot

echo "=== TikTok to Instagram Bot Setup ==="
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "[!] Python 3 is required. Install it first."
    exit 1
fi

echo "[*] Creating virtual environment..."
python3 -m venv venv

echo "[*] Activating virtual environment..."
source venv/bin/activate

echo "[*] Installing dependencies..."
pip install -r requirements.txt

echo "[*] Installing yt-dlp..."
pip install yt-dlp

echo "[*] Creating downloads directory..."
mkdir -p downloads

echo ""
echo "[+] Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Edit config.yaml with your Instagram credentials and topics"
echo "  2. Activate the venv:  source venv/bin/activate"
echo "  3. Test a download:    python main.py --download-only"
echo "  4. Post to Instagram:  python main.py --post-only"
echo "  5. Or do both:         python main.py"
echo ""
echo "To run daily, add a cron job:"
echo '  crontab -e'
echo '  # Add this line (runs at 10 AM daily):'
echo '  0 10 * * * cd /home/user/tiktok-instagram-bot && venv/bin/python main.py'
echo ""
