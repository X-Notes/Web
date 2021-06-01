using System;
using System.Collections.Generic;
using System.Text;
using Tesseract;

namespace FacadeML
{
    public class OcrService
    {
        public OcrService()
        {

        }
        public string GetText(byte[] bytes)
        {
            var ocrengine = new TesseractEngine(@".\tessdata", "eng", EngineMode.Default);
            var img = Pix.LoadFromMemory(bytes);
            var res = ocrengine.Process(img);
            return res.GetText();
        }
    }
}
