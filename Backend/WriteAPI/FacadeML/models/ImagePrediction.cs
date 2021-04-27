using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace FacadeML.models
{
    public class ImagePrediction : ImageData
    {
        public float[] Score;

        public string PredictedLabelValue;

        public string GetFormatedString
        {
            get
            {
                return PredictedLabelValue + "|" + Score.Max();
            }
        }
    }
}
