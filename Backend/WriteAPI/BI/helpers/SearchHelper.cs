using Common.DatabaseModels.models.Files;

namespace BI.helpers
{
    public static class SearchHelper
    {
        public static bool IsMatchContent(string Content, string search)
        {
            if (!string.IsNullOrEmpty(Content) && Content.Contains(search))
            {
                return true;
            }

            return false;
        }

        public static bool IsMatchPhoto(AppFile photo, string search)
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
