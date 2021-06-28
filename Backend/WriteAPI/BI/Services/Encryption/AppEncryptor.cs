using System;
using System.Security.Cryptography;
using System.Text;

namespace BI.Services.Encryption
{
    public class AppEncryptor
    {
        public string Encode(string original)
        {
            byte[] encodedBytes;
            using var md5 = new MD5CryptoServiceProvider();
            var originalBytes = Encoding.Default.GetBytes(original);
            encodedBytes = md5.ComputeHash(originalBytes);
            return Convert.ToBase64String(encodedBytes);
        }

        public bool Compare(string password, string md5pass)
        {
            return Encode(password) == md5pass;
        }
    }
}
