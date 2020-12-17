export const de = {
  settings: {
    name: "Einstellungen",
    language: "Sprache",
    languages: {de: "Deutsch", en: "Englisch (English)"},
    dark: "Dunkles Design"
  },
  menu: {
    name: "Men\xFC",
    open: "Projekt \xF6ffnen",
    new: "Neues Projekt",
    importIED: "IED importieren",
    save: "Projekt speichern",
    validate: "Projekt validieren",
    viewLog: "Protokoll anzeigen"
  },
  openSCD: {
    loading: "Lade Projekt {{ name }}",
    loaded: "{{ name }} geladen",
    readError: "{{ name }} Lesefehler",
    readAbort: "{{ name }} Leseabbruch"
  },
  editing: {
    created: "{{ name }} hinzugef\xFCgt",
    deleted: "{{ name }} entfernt",
    moved: "{{ name }} verschoben",
    updated: "{{ name }} bearbeitet",
    error: {
      create: "Konnte {{ name }} nicht hinzuf\xFCgen",
      update: "Konnte {{ name }} nicht bearbeiten",
      move: "Konnte {{ name }} nicht verschieben",
      nameClash: '{{ parent }} enth\xE4lt bereits ein {{ child }} Kind namens "{{ name }}"'
    }
  },
  validating: {
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
  lnode: {
    wizard: {
      title: {
        selectIEDs: "Auswahl IEDs",
        selectLDs: "Auswahl logische Ger\xE4te",
        selectLNs: "Auswahl logische Knoten"
      },
      placeholder: "Bitte laden Sie eine SCL-Datei, die IED-Elemente enth\xE4lt."
    },
    tooltip: "Referenz zi logischen Knoten erstellen"
  },
  add: "Hinzuf\xFCgen",
  edit: "Bearbeiten",
  save: "Speichern",
  saveAs: "Speichern unter",
  reset: "Zur\xFCcksetzen",
  cancel: "Abbrechen",
  close: "Schlie\xDFen",
  undo: "R\xFCckg\xE4ngig",
  redo: "Wiederholen",
  remove: "Entfernen",
  filter: "Filter",
  move: "Verschieben"
};
