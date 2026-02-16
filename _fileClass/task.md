---
limit: 20
mapWithTag: true
icon: clipboard-list
tagNames:
filesPaths:
bookmarksGroups:
excludes:
extends:
savedViews: []
favoriteView:
fieldsOrder:
  - PPd9ek
  - 1XfjxF
  - kNjGH7
  - qJDmTc
  - EXyXRf
  - aFd3Xx
  - jMBBlX
  - HHBUBL
  - 4HuK5G
  - Zctuwb
  - HvUTLv
  - jFmSHC
  - ijPJ65
  - ainYKk
  - MUtO0S
  - GQpBlY
version: "2.46"
fields:
  - name: name
    type: Input
    options: {}
    path: ""
    id: GQpBlY
  - name: project
    type: File
    options:
      dvQueryString: |-
        dv.pages()
          .where(p => 
            p.fileClass == "project" &&
            !p.file.folder.includes(dv.page("_config/settings").templatesFolder) &&
            !p.file.folder.includes(dv.page("_config/settings").archivesFolder)
          )
          .map(p => p.file.link)
    path: ""
    id: MUtO0S
  - name: createdDate
    type: DateTime
    options:
      dateShiftInterval: 1 day
      dateFormat: MMM DD, yy - HH:mm
      defaultInsertAsLink: false
      linkPath: ""
    path: ""
    id: ainYKk
  - name: modifiedDate
    type: DateTime
    options:
      dateShiftInterval: 1 day
      dateFormat: MMM DD, yy - HH:mm
      defaultInsertAsLink: false
      linkPath: ""
    path: ""
    id: ijPJ65
  - name: favorite
    type: Boolean
    options: {}
    path: ""
    id: jFmSHC
  - name: archived
    type: Boolean
    options: {}
    path: ""
    id: HvUTLv
  - name: startDate
    type: DateTime
    options:
      dateShiftInterval: 1 day
      dateFormat: MMM DD, yy - HH:mm
      defaultInsertAsLink: false
      linkPath: ""
    path: ""
    id: Zctuwb
  - name: endDate
    type: DateTime
    options:
      dateShiftInterval: 1 day
      dateFormat: MMM DD, yy - HH:mm
      defaultInsertAsLink: false
      linkPath: ""
    path: ""
    id: 4HuK5G
  - name: deadlineDate
    type: DateTime
    options:
      dateShiftInterval: 1 day
      dateFormat: MMM DD, yy - HH:mm
      defaultInsertAsLink: false
      linkPath: ""
    path: ""
    id: HHBUBL
  - name: priority
    type: Select
    options:
      sourceType: ValuesFromDVQuery
      valuesFromDVQuery: Object.values(dv.page("_config/values").priorityMap)
    path: ""
    id: jMBBlX
  - name: size
    type: Select
    options:
      sourceType: ValuesFromDVQuery
      valuesFromDVQuery: Object.values(dv.page("_config/values").sizeMap)
    path: ""
    id: aFd3Xx
  - name: parentTask
    type: File
    options:
      dvQueryString: |-
        dv.pages()
          .where(p => 
            p.fileClass == "task" &&
            !p.file.folder.includes(dv.page("_config/settings").templatesFolder) &&
            !p.file.folder.includes(dv.page("_config/settings").archivesFolder)
          )
          .map(p => p.file.link)
    path: ""
    id: EXyXRf
  - name: nextTask
    type: File
    options:
      dvQueryString: |-
        dv.pages()
          .where(p => 
            p.fileClass == "task" &&
            !p.file.folder.includes(dv.page("_config/settings").templatesFolder) &&
            !p.file.folder.includes(dv.page("_config/settings").archivesFolder)
          )
          .map(p => p.file.link)
    path: ""
    id: qJDmTc
  - name: aliases
    type: Multi
    options:
      sourceType: ValuesList
      valuesList: {}
    path: ""
    id: kNjGH7
  - name: area
    type: File
    options:
      dvQueryString: |-
        dv.pages()
          .where(p => 
            p.fileClass == "area" &&
            !p.file.folder.includes(dv.page("_config/settings").templatesFolder) &&
            !p.file.folder.includes(dv.page("_config/settings").archivesFolder)
          )
          .map(p => p.file.link)
    path: ""
    id: 1XfjxF
  - name: status
    type: Select
    options:
      sourceType: ValuesFromDVQuery
      valuesFromDVQuery: Object.values(dv.page("_config/values").statusMap)
    path: ""
    id: PPd9ek
---
