---
limit: 20
mapWithTag: true
icon: file-search-2
tagNames:
filesPaths:
bookmarksGroups:
excludes:
extends:
savedViews: []
favoriteView:
fieldsOrder:
  - HRTqxt
  - FwlOfw
  - KGMKDD
  - ibTV6M
  - DoKVzq
  - qfnjva
  - BU14u5
  - CSeZmq
  - weR7aY
  - ojvEYX
  - MbeiZt
  - cOJoiz
  - Lors4O
  - khRvLh
version: "2.59"
fields:
  - name: createdDate
    type: DateTime
    options:
      dateShiftInterval: 1 day
      dateFormat: MMM DD, yy - HH:mm
      defaultInsertAsLink: false
      linkPath: ""
    path: ""
    id: cOJoiz
  - name: modifiedDate
    type: DateTime
    options:
      dateShiftInterval: 1 day
      dateFormat: MMM DD, yy - HH:mm
      defaultInsertAsLink: false
      linkPath: ""
    path: ""
    id: MbeiZt
  - name: favorite
    type: Boolean
    options: {}
    path: ""
    id: weR7aY
  - name: archived
    type: Boolean
    options: {}
    path: ""
    id: CSeZmq
  - name: tags
    type: Multi
    options:
      sourceType: ValuesList
      valuesList: {}
      valuesListNotePath: 00 - Templates/Resource/Topics - Values.md
    path: ""
    id: BU14u5
  - name: areas
    type: MultiFile
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
    id: DoKVzq
    display: asArray
  - name: projects
    type: MultiFile
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
    id: ibTV6M
  - name: tasks
    type: MultiFile
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
    id: KGMKDD
  - name: aliases
    type: Multi
    options:
      sourceType: ValuesList
      valuesList: {}
    path: ""
    id: blcRsK
  - name: referenceStatus
    type: Select
    options:
      sourceType: ValuesFromDVQuery
      valuesFromDVQuery: Object.values(dv.page("_config/values").referenceStatusMap)
    path: ""
    id: ndlIJ8
  - name: url
    type: Input
    options: {}
    path: ""
    id: 3Zqdfr
  - name: type
    type: Select
    options:
      sourceType: ValuesFromDVQuery
      valuesFromDVQuery: Object.values(dv.page("_config/values").resourceTypeMap)
    path: ""
    id: khRvLh
  - name: location
    type: Select
    options:
      sourceType: ValuesFromDVQuery
      valuesFromDVQuery: Object.values(dv.page("_config/values").sourceTypeMap)
    path: ""
    id: yqGIjP
  - name: author
    type: File
    options:
      dvQueryString: |-
        dv.pages()
          .where(p => 
            p.fileClass == "author" &&
            !p.file.folder.includes(dv.page("_config/settings").templatesFolder) &&
            !p.file.folder.includes(dv.page("_config/settings").archivesFolder)
          )
          .map(p => p.file.link)
    path: ""
    id: qfnjva
  - name: creationStatus
    type: Select
    options:
      sourceType: ValuesFromDVQuery
      valuesFromDVQuery: Object.values(dv.page("_config/values").creationStatusMap)
    path: ""
    id: yTf7C1
  - name: source
    type: File
    options:
      dvQueryString: |-
        dv.pages()
          .where(p => 
            p.fileClass == "source" &&
            !p.file.folder.includes(dv.page("_config/settings").templatesFolder) &&
            !p.file.folder.includes(dv.page("_config/settings").archivesFolder)
          )
          .map(p => p.file.link)
    path: ""
    id: HRTqxt
  - name: resources
    type: MultiFile
    options:
      dvQueryString: |-
        dv.pages()
          .where(p => 
            p.fileClass == "resource" &&
            !p.file.folder.includes(dv.page("_config/settings").templatesFolder) &&
            !p.file.folder.includes(dv.page("_config/settings").archivesFolder)
          )
          .map(p => p.file.link)
    path: ""
    id: y6CJhI
---
