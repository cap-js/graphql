using {managed} from '@sap/cds/common';
using {sap.capire.bookshop} from '../../bookshop/db/schema';

namespace sap.capire.graphql;

extend bookshop.Books with {
  chapters : Composition of many Chapters
               on chapters.book = $self;
}

/** A Chapter of a Book */
entity Chapters : managed {
  key book   : Association to bookshop.Books;
  key number : Integer;
      title  : String;
}
