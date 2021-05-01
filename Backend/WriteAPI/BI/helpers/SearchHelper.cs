using Common.DatabaseModels.models;
using Common.DatabaseModels.models.Files;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BI.helpers
{
    public class SearchHelper
    {
        public bool IsMatchContent(string Content, string search)
        {
            if (!string.IsNullOrEmpty(Content) && Content.Contains(search))
            {
                return true;
            }

            return false;
        }

        public bool IsMatchPhoto(AppFile photo, string search)
        {
            if (photo.RecognizeObject.Contains(search) || photo.TextFromPhoto.Contains(search))
            {
                return true;
            }

            return false;
        }

    }
}
