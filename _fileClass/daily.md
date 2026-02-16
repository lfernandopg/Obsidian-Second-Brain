---
limit: 20
mapWithTag: true
icon: notebook-pen
tagNames: 
filesPaths: 
bookmarksGroups: 
excludes: 
extends: 
savedViews: []
favoriteView: 
fieldsOrder:
  - P8jQL2
  - FNSIpQ
  - Z4xElO
  - HCfiSq
version: "2.77"
fields:
  - name: createdDate
    type: DateTime
    options:
      dateShiftInterval: 1 day
      dateFormat: MMM DD, yy HH:mm
      defaultInsertAsLink: false
      linkPath: ""
    path: ""
    id: HCfiSq
  - name: modifiedDate
    type: DateTime
    options:
      dateShiftInterval: 1 day
      dateFormat: MMM DD, yy HH:mm
      defaultInsertAsLink: false
      linkPath: ""
    path: ""
    id: Z4xElO
  - name: area
    type: File
    options:
      dvQueryString: dv.pages().where(p => p.fileClass == 'area' && !p.file.folder.includes('00 - Templates') && !p.file.folder.includes('40 - Archives')).map(p => p.file.link)
    path: ""
    id: FNSIpQ
  - name: mit
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
    id: 1c10kx
  - name: wakeUpTime
    type: Time
    options:
      dateShiftInterval: 1 hour
      dateFormat: HH:mm
      defaultInsertAsLink: false
      linkPath: ""
    path: ""
    id: S88E9j
  - name: mood
    type: Multi
    options:
      sourceType: ValuesFromDVQuery
      valuesFromDVQuery: Object.values(dv.page("_config/values").moodMap)
    path: ""
    id: hLgIkK
  - name: yesterdayBedTime
    type: Time
    options:
      dateShiftInterval: 1 hour
      dateFormat: HH:mm
      defaultInsertAsLink: false
      linkPath: ""
    path: ""
    id: QM175d
  - name: sleepQuality
    type: Select
    options:
      sourceType: ValuesFromDVQuery
      valuesFromDVQuery: Object.values(dv.page("_config/values").sleepQualityMap)
    path: ""
    id: v2YRD0
  - name: dietQuality
    type: Select
    options:
      sourceType: ValuesFromDVQuery
      valuesFromDVQuery: Object.values(dv.page("_config/values").dietQualityMap)
    path: ""
    id: e0rNAY
  - name: hydrationLevel
    type: Select
    options:
      sourceType: ValuesFromDVQuery
      valuesFromDVQuery: Object.values(dv.page("_config/values").hydrationLevelMap)
    path: ""
    id: gRRxFL
  - name: exerciseLevel
    type: Select
    options:
      sourceType: ValuesFromDVQuery
      valuesFromDVQuery: Object.values(dv.page("_config/values").exerciseLevelMap)
    path: ""
    id: 5ZrbAx
  - name: sunlightExposure
    type: Select
    options:
      sourceType: ValuesFromDVQuery
      valuesFromDVQuery: Object.values(dv.page("_config/values").sunlightExposureMap)
    path: ""
    id: PgbXo7
  - name: hygieneLevel
    type: Select
    options:
      sourceType: ValuesFromDVQuery
      valuesFromDVQuery: Object.values(dv.page("_config/values").hygieneLevelMap)
    path: ""
    id: VBppSh
  - name: energyLevel
    type: Select
    options:
      sourceType: ValuesFromDVQuery
      valuesFromDVQuery: Object.values(dv.page("_config/values").energyLevelMap)
    path: ""
    id: sszPx0
  - name: vitalityLevel
    type: Select
    options:
      sourceType: ValuesFromDVQuery
      valuesFromDVQuery: Object.values(dv.page("_config/values").vitalityLevelMap)
    path: ""
    id: PF04PK
  - name: focusLevel
    type: Select
    options:
      sourceType: ValuesFromDVQuery
      valuesFromDVQuery: Object.values(dv.page("_config/values").focusLevelMap)
    path: ""
    id: P16w3v
  - name: meditationMinutes
    type: Number
    options:
      min: 0
      step: 1
    path: ""
    id: 9EmJ0v
  - name: selfControlLevel
    type: Select
    options:
      sourceType: ValuesFromDVQuery
      valuesFromDVQuery: Object.values(dv.page("_config/values").selfControlLevelMap)
    path: ""
    id: TjBbEk
  - name: environmentCareLevel
    type: Select
    options:
      sourceType: ValuesFromDVQuery
      valuesFromDVQuery: Object.values(dv.page("_config/values").environmentCareLevelMap)
    path: ""
    id: hvnaJc
  - name: socialInteractionsQuality
    type: Select
    options:
      sourceType: ValuesFromDVQuery
      valuesFromDVQuery: Object.values(dv.page("_config/values").socialInteractionsQualityMap)
    path: ""
    id: rRlGAI
  - name: workHours
    type: Number
    options:
      min: 0
      max: 24
      step: 1
    path: ""
    id: ca3Zoi
  - name: pagesRead
    type: Number
    options:
      min: 0
      step: 1
    path: ""
    id: kVniRn
  - name: thesisPomodoros
    type: Number
    options:
      min: 0
      step: 1
    path: ""
    id: b3MIOe
  - name: screenHours
    type: Number
    options:
      step: 1
      min: 0
    path: ""
    id: MtMyFe
  - name: pmoLapse
    type: Select
    options:
      sourceType: ValuesFromDVQuery
      valuesFromDVQuery: Object.values(dv.page("_config/values").pmoLapseMap)
    path: ""
    id: 9BWgu4
  - name: socialMediaExcess
    type: Select
    options:
      sourceType: ValuesFromDVQuery
      valuesFromDVQuery: Object.values(dv.page("_config/values").socialMediaExcessMap)
    path: ""
    id: mqIpGa
  - name: tradingLevel
    type: Select
    options:
      sourceType: ValuesFromDVQuery
      valuesFromDVQuery: Object.values(dv.page("_config/values").tradingLevelMap)
    path: ""
    id: q89K2D
  - name: gratitudeLevel
    type: Select
    options:
      sourceType: ValuesFromDVQuery
      valuesFromDVQuery: Object.values(dv.page("_config/values").gratitudeLevelMap)
    path: ""
    id: ipoV9j
  - name: sensoryLevel
    type: Select
    options:
      sourceType: ValuesFromDVQuery
      valuesFromDVQuery: Object.values(dv.page("_config/values").sensoryLevelMap)
    path: ""
    id: S14iNH
  - name: archived
    type: Boolean
    options: {}
    path: ""
    id: OUT0X6
  - name: favorite
    type: Boolean
    options: {}
    path: ""
    id: FldGFD
  - name: previusDaily
    type: File
    options:
      dvQueryString: |-
        dv.pages()
          .where(p => 
            p.fileClass == "daily" &&
            !p.file.folder.includes(dv.page("_config/settings").templatesFolder) &&
            !p.file.folder.includes(dv.page("_config/settings").archivesFolder)
          )
          .map(p => p.file.link)
    path: ""
    id: AOJDPg
---
