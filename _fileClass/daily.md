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
      sourceType: ValuesList
      valuesList:
        "1": 🧘 Sereno
        "2": 🌅 Optimista
        "3": 🚀 Motivado
        "4": 😄 Alegre
        "5": 🫶 Afectivo
        "6": 😤 Frustrado
        "7": 🪫 Apatico
        "8": 😰 Ansioso
        "9": 😠 Irritable
        "10": 😞 Triste
        "11": 😔 Culpable
        "12": 🌧️ Melancolico
        "13": 🤒 Enfermo
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
      sourceType: ValuesList
      valuesList:
        "1": 1 - 🧟 Pesima
        "2": 2 - 😴 Mala
        "3": 3 - 😐 Regular
        "4": 4 - 👍 Buena
        "5": 5 - ✨ Excelente
    path: ""
    id: v2YRD0
  - name: dietQuality
    type: Select
    options:
      sourceType: ValuesList
      valuesList:
        "1": 1 - 🗑️ Desastrosa
        "2": 2 - 🍕 Mala
        "3": 3 - 🍲Regular
        "4": 4 - 🥗 Buena
        "5": 5 - 🥦 Óptima
    path: ""
    id: e0rNAY
  - name: hydrationLevel
    type: Select
    options:
      sourceType: ValuesList
      valuesList:
        "1": 1 - 🌵 Deshidratado
        "2": 2 - 💧 Regular
        "3": 3 - 🌊 Hidratado
    path: ""
    id: gRRxFL
  - name: exerciseLevel
    type: Select
    options:
      sourceType: ValuesList
      valuesList:
        "1": 0 - 🛋️ Nulo
        "2": 1 - 🐢 Bajo
        "3": 2 - 🚶 Regular
        "4": 3 - 🏋️ Alto
        "5": 4 - 🏆 Excepcional
    path: ""
    id: 5ZrbAx
  - name: sunlightExposure
    type: Select
    options:
      sourceType: ValuesList
      valuesList:
        "1": 0 - 🌑 Nula
        "2": 1 - 🌥️ Baja (<10 min)
        "3": 2 - 🌤️ Normal (10-30 min)
        "4": 3 - ☀️ Alta (>30 min)
        "5": 4 - 🥵 Insolacion
    path: ""
    id: PgbXo7
  - name: hygieneLevel
    type: Select
    options:
      sourceType: ValuesList
      valuesList:
        "1": 0 - 🤢 Nula
        "2": 1 - 😷 Baja
        "3": 2 - 🧼 Normal
        "4": 3 - 🛀🏻 Alta
    path: ""
    id: VBppSh
  - name: energyLevel
    type: Select
    options:
      sourceType: ValuesList
      valuesList:
        "1": 1 - 🪫 Muy baja
        "2": 2 - 🥱 Baja
        "3": 3 - 😐 Regular
        "4": 4 - 🚀 Alta
        "5": 5 - ⚡ Muy alta
    path: ""
    id: sszPx0
  - name: vitalityLevel
    type: Select
    options:
      sourceType: ValuesList
      valuesList:
        "1": 1 - 💀 Muy baja
        "2": 2 - 👇🏼 Baja
        "3": 3 - 😌 Normal
        "4": 4 - 🍆 Alta
        "5": 5 - 🔥 Muy alta
    path: ""
    id: PF04PK
  - name: focusLevel
    type: Select
    options:
      sourceType: ValuesList
      valuesList:
        "1": 1 - 🦋 Súper distraído
        "2": 2 - 😵‍💫 Distraído
        "3": 3 - 😐 Normal
        "4": 4 - 🧐 Concentrado
        "5": 5 - 🎯 Súper enfocado
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
      sourceType: ValuesList
      valuesList:
        "1": 1 - 🎢 Muy bajo
        "2": 2 - 🚦Bajo
        "3": 3 - ⚖️ Normal
        "4": 4 - 💪 Alto
        "5": 5 - 👑 Muy alto
    path: ""
    id: TjBbEk
  - name: environmentCareLevel
    type: Select
    options:
      sourceType: ValuesList
      valuesList:
        "1": 1 - 💩 Muy bajo
        "2": 2 - 🏚️ Bajo
        "3": 3 - 🧹 Normal
        "4": 4 - 🏡 Alto
        "5": 5 - 💎 Muy alto
    path: ""
    id: hvnaJc
  - name: socialInteractionsQuality
    type: Select
    options:
      sourceType: ValuesList
      valuesList:
        "1": 0 - 🚫 Nulas
        "2": 1 - 👋 Limitadas
        "3": 2 - 😊 Satisfactorias
        "4": 3 - ✨ Bastantes
        "5": 4 - 💖 Excepcionales
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
      sourceType: ValuesList
      valuesList:
        "1": 0 - ✅ Nulo
        "2": 1 - 🤏 Poco
        "3": 2 - 🔁 Bastante
        "4": 3 - 🌪️ Desenfrenado
    path: ""
    id: 9BWgu4
  - name: socialMediaExcess
    type: Select
    options:
      sourceType: ValuesList
      valuesList:
        "1": 0 - ✅ Nulo
        "2": 1 - 🤏 Poco
        "3": 2 - ⏳ Bastante
        "4": 3 - 😵 Desenfrenado
    path: ""
    id: mqIpGa
  - name: tradingLevel
    type: Select
    options:
      sourceType: ValuesList
      valuesList:
        "1": 0 - ❌ Nulo
        "2": 1 - 🤦‍♂️ Desastre
        "3": 2 - ⚠️ Malo
        "4": 3 - ⚖️ Neutral
        "5": 4 - 🚀 Bueno
        "6": 5 - 🏆 Excelente
    path: ""
    id: q89K2D
  - name: gratitudeLevel
    type: Select
    options:
      sourceType: ValuesList
      valuesList:
        "1": 0 - 😔 Ausente
        "2": 1 - 😌 Reconocida
        "3": 2 - 😊 Consciente
        "4": 3 - 🙏 Intensa
    path: ""
    id: ipoV9j
  - name: sensoryLevel
    type: Select
    options:
      sourceType: ValuesList
      valuesList:
        "1": 0 - 😵‍💫 Desconectado
        "2": 1 - 👁️ Casual
        "3": 2 - 🌿 Atento
        "4": 3 - ✨ Totalmente Presente
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
