using Common.DatabaseModels.models;
using Common.DTO.app;
using System;
using System.Collections.Generic;
using System.Text;

namespace Common.DTO.folders
{
    public class FullFolder
    {
        public Guid Id { get; set; }
        public string Title { set; get; }
        public string Color { set; get; }
        public FolderTypeDTO FolderType { set; get; }
        public RefTypeDTO RefType { set; get; }
    }
}
