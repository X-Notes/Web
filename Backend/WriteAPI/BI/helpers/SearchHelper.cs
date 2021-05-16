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
            var flag = false;
            if(!string.IsNullOrEmpty(photo.RecognizeObject))
            {
                flag = photo.RecognizeObject.Contains(search);
                if(flag)
                {
                    return flag;
                }
            }

            if (!string.IsNullOrEmpty(photo.TextFromPhoto))
            {
                flag = photo.TextFromPhoto.Contains(search);
                if (flag)
                {
                    return flag;
                }
            }

            return flag;
        }

    }
}
