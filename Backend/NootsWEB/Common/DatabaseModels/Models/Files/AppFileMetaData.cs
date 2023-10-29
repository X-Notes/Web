using System;

namespace Common.DatabaseModels.Models.Files
{
    public class AppFileMetaData
    {
        public int SecondsDuration { set; get; }

        public Guid? ImageFileId { set; get; }
        
        public string ImagePath { set; get; }
    }
}
