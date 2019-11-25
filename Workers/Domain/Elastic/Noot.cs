using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Elastic
{
    public class Noot
    {
        public int Id { set; get; }
        public string Title { set; get; }
        public string Description { set; get; }
        public string Location { set; get; }
        public string Author { set; get; }
        public DateTime Date { set; get; }
    }
}
