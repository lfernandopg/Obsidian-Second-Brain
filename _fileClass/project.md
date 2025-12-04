---
limit: 20
icon: folder-closed
tagNames: 
filesPaths: 
bookmarksGroups: 
excludes: 
extends: 
savedViews: []
favoriteView: 
fieldsOrder:
  - rTmRrp
  - haKvFU
  - yCtlZR
  - obt0T5
  - DUWA3y
  - GanDuf
  - YYiv6Z
  - 3ej9yH
  - ySlLz0
  - C0CAi0
  - 6fZsKZ
fields:
  - name: status
    type: Select
    options:
      sourceType: ValuesList
      valuesList:
        "1": ⚪️ Inbox
        "2": 🔵 Planned
        "3": 🟡 In progress
        "4": 🔴 Blocked
        "5": 🟢 Done
        "6": ⛔ Canceled
    path: ""
    id: 6fZsKZ
  - name: startDate
    type: Date
    options:
      dateShiftInterval: 1 day
      dateFormat: MMM DD, yy
      defaultInsertAsLink: false
      linkPath: ""
    path: ""
    id: C0CAi0
  - name: endDate
    type: Date
    options:
      dateShiftInterval: 1 day
      dateFormat: MMM DD, yy
      defaultInsertAsLink: false
      linkPath: ""
    path: ""
    id: ySlLz0
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
    id: 3ej9yH
  - name: deadlineDate
    type: Date
    options:
      dateShiftInterval: 1 day
      dateFormat: MMM DD, yy
      defaultInsertAsLink: false
      linkPath: ""
    path: ""
    id: YYiv6Z
  - name: favorite
    type: Boolean
    options: {}
    path: ""
    id: GanDuf
  - name: archived
    type: Boolean
    options: {}
    path: ""
    id: DUWA3y
  - name: priority
    type: Select
    options:
      sourceType: ValuesList
      valuesList:
        "1": ⚪️ Low
        "2": 🔵 Medium
        "3": 🟡 High
        "4": 🔴 Critical
    path: ""
    id: obt0T5
  - name: createdDate
    type: DateTime
    options:
      dateShiftInterval: 1 day
      dateFormat: MMM DD, yy - HH:mm
      defaultInsertAsLink: false
      linkPath: ""
    path: ""
    id: yCtlZR
  - name: modifiedDate
    type: DateTime
    options:
      dateShiftInterval: 1 day
      dateFormat: MMM DD, yy - HH:mm
      defaultInsertAsLink: false
      linkPath: ""
    path: ""
    id: haKvFU
  - name: aliases
    type: Multi
    options:
      sourceType: ValuesList
      valuesList: {}
    path: ""
    id: rTmRrp
version: "2.47"
mapWithTag: true
---
