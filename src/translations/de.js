export const de = {
  scl: {
    id: "ID",
    name: "Name",
    desc: "Beschreibung",
    ord: "Rang",
    value: "Wert",
    EnumVal: "Enum Wert",
    EnumType: "Enum Typ",
    DA: "Datenattribut",
    DO: "Datenobjekt",
    DAType: "Datenattribut Typ",
    DOType: "Datenobjekt Typ",
    CDC: " Datenklasse nach 7-3",
    Report: "Report",
    LN: "Logischer Knoten",
    bType: "Basic type",
    type: "Type",
    sAddr: "Short address",
    valKind: "Value kind",
    valImport: "Import value",
    fc: "Funktionale Einschr\xE4nkung",
    LNodeType: "Logischer Knoten Type",
    lnClass: "Klasse logischer Knoten",
    accessControl: "Zugriffskontrolle",
    transient: "Datenpunkt transient"
  },
  settings: {
    title: "Einstellungen",
    language: "Sprache",
    languages: {de: "Deutsch", en: "Englisch (English)"},
    dark: "Dunkles Design",
    mode: "Profimodus",
    showieds: "Zeige IEDs im Substation-Editor"
  },
  menu: {
    title: "Men\xFC",
    viewLog: "Protokoll anzeigen"
  },
  openSCD: {
    loading: "Lade Projekt {{ name }}",
    loaded: "{{ name }} geladen",
    readError: "{{ name }} Lesefehler",
    readAbort: "{{ name }} Leseabbruch"
  },
  zeroline: {
    iedsloading: "IEDs werden geladen...",
    showieds: "IEDs anzeigen/ausblenden"
  },
  editing: {
    created: "{{ name }} hinzugef\xFCgt",
    deleted: "{{ name }} entfernt",
    moved: "{{ name }} verschoben",
    updated: "{{ name }} bearbeitet",
    import: "{{name}} importiert",
    error: {
      create: "Konnte {{ name }} nicht hinzuf\xFCgen",
      update: "Konnte {{ name }} nicht bearbeiten",
      move: "Konnte {{ name }} nicht verschieben",
      duplicate: "Konnte {{name}} nicht kopieren",
      nameClash: '{{ parent }} enth\xE4lt bereits ein {{ child }} Kind namens "{{ name }}"'
    }
  },
  validate: {
    title: "Projekt validieren",
    valid: "{{ name }} erfolgreich validiert",
    invalid: "{{ name }} Validierung fehlgeschlagen",
    fatal: "Fataler Validierungsfehler",
    loadError: "Konnte Schema {{ name }} nicht laden"
  },
  textfield: {
    required: "Pflichtfeld",
    nonempty: "Darf nicht leer sein",
    noMultiplier: "keiner",
    unique: "Darf sich nicht wiederholen"
  },
  log: {
    name: "Protokoll",
    placeholder: "Hier werden \xC4nderungen, Fehler und andere Meldungen angezeigt.",
    snackbar: {
      show: "Anzeigen",
      placeholder: "Keine Fehler"
    }
  },
  plugins: {
    heading: "Erweiterungen",
    editor: "Editor",
    menu: "Men\xFCeintrag",
    requireDoc: "Ben\xF6tigt Dokument",
    top: "oben",
    middle: "mittig",
    bottom: "unten",
    validator: "Validator",
    add: {
      heading: "Benutzerdefinierte Erweiterung",
      warning: `Hier k\xF6nnen Sie benutzerdefinierte Erweiterungen hinzuf\xFCgen.
                OpenSCD \xFCbernimmt hierf\xFCr keine Gew\xE4hr.`,
      name: "Name",
      nameHelper: "Lokaler Name der Erweiterung (frei w\xE4hlbar)",
      src: "URL",
      srcHelper: "Die Erweiterungs-URL des Herstellers"
    }
  },
  substation: {
    name: "Schaltanlage",
    missing: "Keine Schaltanlage",
    wizard: {
      nameHelper: "Name der Schaltanlage",
      descHelper: "Beschreibung der Schaltanlage",
      title: {
        add: "Schaltanlage hinzuf\xFCgen",
        edit: "Schaltanlage bearbeiten"
      }
    },
    action: {
      addvoltagelevel: "Spannungsebene hinzuf\xFCgen"
    }
  },
  voltagelevel: {
    name: "Spannungsebene",
    wizard: {
      nameHelper: "Name der Spannungsebene",
      descHelper: "Beschreibung der Spannungsebene",
      nomFreqHelper: "Nennfrequenz",
      numPhaseHelper: "Phasenanzahl",
      voltageHelper: "Nennspannung",
      title: {
        add: "Spannungsebene hinzuf\xFCgen",
        edit: "Spannungsebene bearbeiten"
      }
    }
  },
  bay: {
    name: "Feld",
    wizard: {
      nameHelper: "Feldname",
      descHelper: "Beschreibung des Feldes",
      title: {
        add: "Feld hinzuf\xFCgen",
        edit: "Feld bearbeiten"
      }
    }
  },
  conductingequipment: {
    name: "Prim\xE4relement",
    wizard: {
      nameHelper: "Name des Prim\xE4relements",
      descHelper: "Beschreibung des Prim\xE4relements",
      typeHelper: "Type des Prim\xE4relements",
      title: {
        add: "Prim\xE4relement hinzuf\xFCgen",
        edit: "Prim\xE4relement bearbeiten"
      }
    },
    unknownType: "Unbekannter Typ"
  },
  templates: {
    name: "Data Type Templates",
    missing: "DataTypeTemplates fehlen",
    add: "DataTypeTemplates hinzuf\xFCgen"
  },
  "enum-val": {
    wizard: {
      title: {
        add: "EnumVal hinzuf\xFCgen",
        edit: "EnumVal bearbeiten"
      }
    }
  },
  enum: {
    wizard: {
      title: {
        add: "EnumType hinzuf\xFCgen",
        edit: "EnumType bearbeiten"
      }
    }
  },
  datype: {
    wizard: {
      title: {
        add: "DAType hinzuf\xFCgen",
        edit: "DAType bearbeiten"
      }
    }
  },
  bda: {
    wizard: {
      title: {
        add: "BDA hinzuf\xFCgen",
        edit: "BDA bearbeiten"
      }
    }
  },
  da: {
    wizard: {
      title: {
        add: "Add DA",
        edit: "Edit DA"
      }
    }
  },
  sdo: {
    wizard: {
      title: {
        add: "SDO hinzuf\xFCgen",
        edit: "SDO bearbeiten"
      }
    }
  },
  do: {
    wizard: {
      title: {
        add: "DO hinzuf\xFCgen",
        edit: "DO bearbeiten"
      }
    }
  },
  dotype: {
    wizard: {
      title: {
        add: "DOType hinzuf\xFCgen",
        edit: "DOType bearbeiten"
      },
      enums: "Standard Enumerations"
    }
  },
  lnodetype: {
    wizard: {
      title: {
        add: "LNodeType hinzuf\xFCgen",
        edit: "LNodeType bearbeiten",
        select: "Data Objects ausw\xE4hlen"
      }
    },
    autoimport: "Vordefinierte OpenSCD LN Klasse verwenden",
    missinglnclass: "Vordefinierte LN Klasse fehlt"
  },
  lnode: {
    wizard: {
      title: {
        selectIEDs: "Auswahl IEDs",
        selectLDs: "Auswahl logische Ger\xE4te",
        selectLNs: "Auswahl logische Knoten"
      },
      placeholder: "Bitte laden Sie eine SCL-Datei, die IED-Elemente enth\xE4lt."
    },
    tooltip: "Referenz zu logischen Knoten erstellen"
  },
  guess: {
    wizard: {
      primary: "Inhalt erraten",
      title: "Auswahl Steuerungsmodel(ctlModel)",
      description: `Schaltger\xE4ten im Feld k\xF6nnen oftmals bestimmten Steuerungsmodellen zugeordnet werden. 
 Damit wird die Absch\xE4tzung oftmals genauer.`
    }
  },
  merge: {
    title: "Vereinigen",
    defaultTitle: "{{ tag }} {{ source }} mit {{ sink }} vereinigen",
    log: "{{ tag }} {{ source }} mit {{ sink }} vereinigt",
    children: "Kindelemente"
  },
  import: {
    title: "IEDs importieren",
    log: {
      successful: "IED {{name}} geladen",
      parsererror: "Parser Fehler",
      loaderror: "Datei kann nicht geladen werden",
      importerror: "IED Element kann nicht importiert werden",
      missingied: "Kein IED Element in der Datei",
      nouniqueied: "IED Element {{ name }} bereits geladen"
    }
  },
  communication: {
    name: "Netzwerkkonfiguration",
    missing: "Kein Subnetzwerk"
  },
  subnetwork: {
    name: "Subnetzwerk",
    wizard: {
      nameHelper: "Name des Subnetzwerkes",
      descHelper: "Beschreibung des Subnetzwerkes",
      typeHelper: "Netzwerktyp (Bsp. 8-MMS)",
      bitrateHelper: "\xDCbertragungsrate",
      title: {
        add: "Subnetzwerk hinzuf\xFCgen",
        edit: "Subnetzwerk bearbeiten"
      }
    }
  },
  connectedap: {
    name: "Schnittstelle",
    wizard: {
      addschemainsttype: "XMLSchema-instance type hinzuf\xFCgen",
      title: {
        connect: "Schnittstelle verbinden",
        edit: "Schnittstelle bearbeiten"
      }
    },
    action: {
      addaddress: "Adressfeld bearbeitet ({{iedName}} - {{apName}})"
    }
  },
  subscriber: {
    title: "Subscriber Update",
    description: "GOOSE Ziele aktualisieren: ",
    nonewitems: "keine neuen IEDName Elemente notwendig",
    message: "{{updatenumber}} IEDName Element(e) hinzugef\xFCgt"
  },
  commMap: {
    title: "Kommunikationszuordnung",
    connectCB: "{{CbType}} verbinden",
    connectToIED: "Verbinden mit {{iedName}}",
    sourceIED: "Quellger\xE4t",
    sinkIED: "Zielger\xE4t"
  },
  updatesubstation: {
    title: "Schaltanlage aktualisieren"
  },
  code: {
    log: "Element im XML Editor angepasst:  {{id}}"
  },
  add: "Hinzuf\xFCgen",
  new: "Neu",
  remove: "Entfernen",
  edit: "Bearbeiten",
  move: "Verschieben",
  create: "Erstellen",
  save: "Speichern",
  saveAs: "Speichern unter",
  open: "\xD6ffnen",
  reset: "Zur\xFCcksetzen",
  cancel: "Abbrechen",
  close: "Schlie\xDFen",
  filter: "Filter",
  undo: "R\xFCckg\xE4ngig",
  redo: "Wiederholen",
  duplicate: "Klonen",
  connect: "Verbinden",
  disconnect: "Trennen",
  next: "Weiter"
};
