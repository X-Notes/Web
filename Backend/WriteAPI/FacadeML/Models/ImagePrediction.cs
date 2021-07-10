using System.Linq;

namespace FacadeML.Models
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
