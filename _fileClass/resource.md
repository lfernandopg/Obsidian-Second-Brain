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
      sourceType: ValuesList
      valuesList:
        "2": ⚪️ Inbox
        "3": 🔵 To Review
        "4": 🟡 Under Review
        "5": 🟢 Reviewed
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
      sourceType: ValuesList
      valuesList:
        "1": 📰 Article
        "2": 📄 Paper / Investigation
        "3": 📚 Book
        "4": ✍️ Essay
        "5": 📝 Note
        "6": 📓 Notebook
        "7": 🧭 Guide
        "8": 💻 Code
        "9": 🤖 AI Generated
        "10": 💬 Prompt
        "11": 📊 Report
        "12": 📁 Document
        "13": 🎥 Video
        "14": 🖼️ Image
        "15": 🎙️ Podcast
        "16": 👩‍🏫 Lecture
        "17": 🎓 Course
        "18": 💻 Presentation
        "19": 🗣️ Discussion
      valuesListNotePath: 00 - Templates/Resource/Type - Values.md
    path: ""
    id: khRvLh
  - name: location
    type: Select
    options:
      sourceType: ValuesList
      valuesList:
        "1": 📦 Local File
        "2": 🌐 Web URL
        "3": 📝 Obsidian Note
        "4": 🗃️ Physical Resource
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
      sourceType: ValuesList
      valuesList:
        "2": ⚪️ Inbox
        "3": 🟡 Draft
        "4": 🟢 Completed
        "5": 🔵 Updated
        "6": 🌐 Published
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
