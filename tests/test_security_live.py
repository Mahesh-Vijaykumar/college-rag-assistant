import requests
import time
import sys

BASE_URL = "http://localhost:8000"
ADMIN_URL = f"{BASE_URL}/admin"

def test_security_headers():
    print("\nTesting Security Headers...")
    try:
        response = requests.get(BASE_URL)
        headers = response.headers
        
        required_headers = [
            "X-Content-Type-Options",
            "X-Frame-Options",
            "X-XSS-Protection",
            "Strict-Transport-Security",
            "Content-Security-Policy"
        ]
        
        all_present = True
        for header in required_headers:
            if header in headers:
                print(f"✅ {header}: Present")
            else:
                print(f"❌ {header}: Missing")
                all_present = False
                
        if all_present:
            print("✅ All security headers present")
        else:
            print("❌ Some security headers are missing")
            
    except Exception as e:
        print(f"❌ Error connecting to server: {e}")

def test_rate_limiting():
    print("\nTesting Rate Limiting (Brute Force Protection)...")
    # Use a wrong password
    credentials = {"username": "admin", "password": "wrongpassword"}
    
    for i in range(1, 8):
        try:
            response = requests.post(f"{ADMIN_URL}/login", json=credentials)
            print(f"Attempt {i}: Status {response.status_code}")
            
            if response.status_code == 429:
                print("✅ Rate limiting triggered successfully (429 Too Many Requests)")
                return
                
        except Exception as e:
            print(f"❌ Request failed: {e}")
            
    print("❌ Rate limiting failed to trigger after 7 attempts")

def test_login_flow():
    print("\nTesting Login and Token Flow...")
    # Use default credentials (assuming they haven't been changed yet)
    credentials = {"username": "admin", "password": "admin"}
    
    try:
        # 1. Login
        response = requests.post(f"{ADMIN_URL}/login", json=credentials)
        if response.status_code != 200:
            print(f"❌ Login failed: {response.status_code} - {response.text}")
            return
            
        data = response.json()
        access_token = data.get("access_token")
        refresh_token = data.get("refresh_token")
        
        if access_token and refresh_token:
            print("✅ Login successful, received access and refresh tokens")
        else:
            print("❌ Login response missing tokens")
            return

        # 2. Test Access Token
        headers = {"Authorization": f"Bearer {access_token}"}
        response = requests.get(f"{ADMIN_URL}/documents", headers=headers)
        if response.status_code == 200:
            print("✅ Access token works for protected endpoint")
        else:
            print(f"❌ Access token failed: {response.status_code}")

        # 3. Test Refresh Token
        refresh_data = {"refresh_token": refresh_token}
        response = requests.post(f"{ADMIN_URL}/refresh", json=refresh_data)
        if response.status_code == 200:
            new_access_token = response.json().get("access_token")
            if new_access_token:
                print("✅ Token refresh successful")
            else:
                print("❌ Refresh response missing access token")
        else:
            print(f"❌ Token refresh failed: {response.status_code} - {response.text}")

        # 4. Test Logout
        response = requests.post(f"{ADMIN_URL}/logout", json=refresh_data, headers=headers)
        if response.status_code == 200:
            print("✅ Logout successful")
        else:
            print(f"❌ Logout failed: {response.status_code}")
            
        # 5. Verify Refresh Token is Revoked
        response = requests.post(f"{ADMIN_URL}/refresh", json=refresh_data)
        if response.status_code == 401:
            print("✅ Revoked refresh token correctly rejected")
        else:
            print(f"❌ Revoked refresh token was accepted: {response.status_code}")

    except Exception as e:
        print(f"❌ Error during login flow: {e}")

if __name__ == "__main__":
    print("🔒 Starting Security Verification Tests...")
    test_security_headers()
    test_login_flow()
    test_rate_limiting()
