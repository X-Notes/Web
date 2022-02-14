using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.DatabaseModels.Models.Files
{
    public class AppFileMetaData
    {
        public int? SecondsDuration { set; get; }

        public Guid? ImageFileId { set; get; }

        public string ImagePath { set; get; }
    }
}
