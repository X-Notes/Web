using MongoDB.Bson;
using Shared.Mongo.Parts;
using System;
using System.Collections.Generic;
using System.Text;

namespace Shared.Mongo
{
    public class Note
    {
        public ObjectId Id { set; get; }
        public string Email { set; get; }
        public string Title { set; get; }
        public int Order { set; get; }
        public List<Part> Parts { set; get; }
        public List<ObjectId> Labels { set; get; }
        public bool Deleted { set; get; }
        public bool Locked { set; get; }
        public string ReferanceForEdit { set; get; }
        public string ReferanceForRead { set; get; }
    }
}
