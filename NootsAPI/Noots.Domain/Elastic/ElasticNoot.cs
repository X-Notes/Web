﻿using System;
using System.Collections.Generic;
using System.Text;

namespace Noots.Domain.Elastic
{
    public class ElasticNoot
    {
        public int Id { set; get; }
        public string Title { set; get; }
        public string Description { set; get; }
        public string Location { set; get; }
        public string Author { set; get; }
        public DateTime Date { set; get; }
    }
}
