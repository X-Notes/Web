using System;
using System.Collections.Generic;
using System.Text;
using Tesseract;

namespace FacadeML
{
    public class OcrService
    {
        private readonly TesseractEngine ocrengine = new TesseractEngine(@".\tessdata", "eng", EngineMode.Default);
        public OcrService()
        {

        }
        public string GetText(string path)
        {
            var img = Pix.LoadFromFile(path);
            var res = ocrengine.Process(img);
            return res.GetText();
        }
    }
}
