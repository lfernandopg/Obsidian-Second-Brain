---
fileClass: resource
type: 💬 Prompt
referenceStatus: ⚪️ Inbox
creationStatus:
source: "[[Local Machine]]"
location: 📝 Obsidian Note
author: "[[Luis Fernando Peña (Me)]]"
tags:
url:
areas:
projects:
tasks:
resources: "[[Untitled]]"
aliases:
createdDate: Oct 20, 2025 - 08:42
modifiedDate: Oct 20, 2025 - 08:59
favorite: false
archived: false
---
---
Soy estudiante de la universidad central de la UCV, estoy haciendo mi semario de Inteligencia artificial, sobre la deteccion del discurso de odio con Machine Learning, que va a tener 4 capitulos, necesito que hagas una busqueda extensa de articulos en arxiv y google scholar, aproximadamente 20 articulos, y poder realizar el primer capitulo el cual es el estado del arte, donde se estara estudiando como se estuvo haciendo la deteccion del discurso de odio con ML a lo largo del tiempo hasta la fecha, que tecnicas se usaron, modelos, sus metricas, desafios entre otros. ¿Qué técnicas se usaban antes del auge del Machine Learning moderno?
¿Cuáles fueron los primeros enfoques de Machine Learning aplicados al problema? (Probablemente modelos como SVM, Naive Bayes, Regresión Logística), ¿Cuales son los enfoques mas actuales?. Representación del Texto, Datasets Utilizados.
Toda la investigacion debe estar respaldada por articulos cientificos. 

El capitulo se puede organizar de la siguiente manera:

Primeros Enfoques y Métodos Tradicionales (Sentando las Bases)
* Basado en tus artículos más antiguos, describe cómo se abordaba inicialmente el problema.
* ¿Se usaban reglas manuales o enfoques basados en diccionarios?
* ¿Cuáles fueron las primeras técnicas de Machine Learning aplicada?
* Menciona los resultados típicos o las limitaciones de estos enfoques iniciales según los papers.

La Era del Deep Learning y Embeddings (Evolución de las Técnicas)
* Aquí es donde muestras el cambio hacia modelos más complejos.
* Describe el impacto de los Word Embeddings (Word2Vec, GloVe) y cómo mejoraron la representación del texto.
* Presenta el uso de Redes Neuronales (CNNs, RNNs, LSTMs, GRUs) para este problema. Explica por qué fueron una mejora (capturan secuencias, contexto local/global).
* Para los artículos relevantes en esta sección, describe el modelo DL usado, el tipo de embeddings, los datasets y las métricas clave reportadas.

El Impacto de los Modelos Pre-entrenados y Transformers (Estado del Arte Actual)
* Discute cómo modelos grandes pre-entrenados como BERT, RoBERTa, y sus adaptaciones (Ej: HateBERT) han transformado el campo.
* Por qué estos modelos son tan potentes.
* Detalla los enfoques basados en Transformers encontrados en tus artículos más recientes.
* Para estos papers, menciona los modelos específicos (BERT, etc.), cómo los adaptaron, los datasets más recientes y los resultados de rendimiento de vanguardia (utilizando las métricas relevantes).
---
Soy estudiante de la universidad central de la UCV, estoy haciendo mi semario de Inteligencia artificial, sobre la deteccion del discurso de odio con Machine Learning, que va a tener 4 capitulos (Estado del arte, Marco Teorico, Marco Metodologico y Propuesta Trabajo Especial de Grado), necesito que hagas una busqueda extensa de articulos en arxiv y google scholar, aproximadamente 20 articulos, y poder realizar el primer capitulo el cual es el estado del arte, donde se estara estudiando como se estuvo haciendo la deteccion del discurso de odio con ML a lo largo del tiempo hasta la fecha, que tecnicas se usaron, modelos, sus metricas, desafios entre otros. ¿Qué técnicas se usaban antes del auge del Machine Learning moderno?
¿Cuáles fueron los primeros enfoques de Machine Learning aplicados al problema? (Probablemente modelos como SVM, Naive Bayes, Regresión Logística, KNN, SGDClassifier, Random Forest), ¿Cuales son los enfoques mas actuales?. Representación del Texto, Datasets Utilizados.
Toda la investigacion debe estar respaldada por articulos cientificos. 

Aquí tienes una estructura para el Capítulo 1 (Estado del Arte):

- Evolución de los Enfoques Metodológicos (El "Cómo se ha Hecho")
* Esta es la sección principal donde describes la trayectoria de la investigación.
* No necesitas explicar qué es un SVM o un Transformer aquí (eso va en el Marco Teórico). En cambio, describe cómo se aplicaron al problema de la detección de discurso de odio y qué resultados se obtuvieron.

- Enfoques Tempranos y Basados en Reglas/Diccionarios: Describe los métodos más antiguos y cómo se hizo la transición a ML simple. 

- Aplicaciones Iniciales de Machine Learning Tradicional: ¿Cómo se usaron SVM, Naive Bayes, etc.? ¿Qué tipo de features (TF-IDF, n-grams) se usaban con ellos? (Describe el uso de las features, no la explicación matemática de TF-IDF).

- Integración de Word Embeddings y Modelos Neuronales Simples: Describe el impacto de los embeddings y cómo se combinaron con CNNs o RNNs básicas.

- Avances con LSTMs, GRUs y Mecanismos de Atención: Describe la aplicación de arquitecturas neuronales más avanzadas para capturar dependencias complejas.

- El Paradigma de los Modelos Pre-entrenados (Transformers): Describe cómo modelos como BERT y sus variantes se aplican mediante fine-tuning para lograr resultados de vanguardia.
* Dentro de cada sub-sección, menciona los modelos específicos aplicados, los datasets clave utilizados en esos trabajos particulares, las métricas reportadas y los resultados obtenidos. Compara y contrasta si los artículos lo permiten.

- Datasets y Desafíos Asociados a los Datos
* Discute los principales datasets que aparecen en la literatura revisada.
* Señala las características importantes de estos datasets (fuente, idioma, tamaño, esquema de etiquetado).
* Enfócate en los desafíos inherentes a los datos para este problema: el desbalance de clases (un punto muy importante), la subjetividad de la anotación, la calidad de los datos, la evolución del lenguaje, la necesidad de datos en diversos idiomas, etc.

- Métricas y Metodologías de Evaluación en la Literatura
* Describe cómo se mide el rendimiento de los modelos en los estudios revisados.
* Explica la importancia de las métricas adecuadas (Precision, Recall, F1-score, AUC) dado el problema del desbalance de clases. ¿Por qué Accuracy no es suficiente?
* Menciona si hay enfoques de evaluación estandarizados o comparativas comunes.

- Desafíos Persistentes y Limitaciones de los Enfoques Existentes (El "Por Qué Aún No Está Resuelto")
* Esta sección es CRUCIAL para justificar tu propuesta.
* Sintetiza las limitaciones y dificultades que han enfrentado los investigadores a pesar de los avances técnicos.
* Revisa los desafíos ya mencionados en el punto anterior y amplía otros: la detección de sarcasmo/ironía, el discurso de odio implícito vs. explícito, la generalización a nuevos dominios/plataformas, los problemas de sesgo en los modelos, la explicabilidad de los resultados, los desafíos de implementación en tiempo real.
* Presenta estos desafíos como brechas en la investigación existente.
---
Soy estudiante de la universidad central de la UCV, estoy haciendo mi semario de Inteligencia artificial, sobre la deteccion del discurso de odio con Machine Learning, que va a tener 4 capitulos (Estado del arte, Marco Teorico, Marco Metodologico y Propuesta Trabajo Especial de Grado), necesito que hagas una busqueda extensa de articulos en arxiv y google scholar (mayoritariamente arvix), aproximadamente 20 articulos o mas, y poder realizar el primer capitulo el cual es el estado del arte, donde se estara estudiando como se estuvo haciendo la deteccion del discurso de odio con ML a lo largo del tiempo hasta la fecha, que tecnicas se usaron, modelos, sus metricas, desafios entre otros. ¿Qué técnicas se usaban antes del auge del Machine Learning moderno?
¿Cuáles fueron los primeros enfoques de Machine Learning aplicados al problema? (Probablemente modelos como SVM, Naive Bayes, Regresión Logística, KNN, SGDClassifier, Random Forest), ¿Cuales son los enfoques mas actuales?. Representación del Texto, Datasets Utilizados.

Toda la investigacion debe estar respaldada por articulos cientificos. 

Aquí tienes una estructura para el Capítulo 1 (Estado del Arte):

- Evolución de los Enfoques Metodológicos (El "Cómo se ha Hecho")
* Esta es la sección principal donde describes la trayectoria de la investigación.
* No necesitas explicar qué es un SVM o un Transformer aquí (eso va en el Marco Teórico). En cambio, describe cómo se aplicaron al problema de la detección de discurso de odio y qué resultados se obtuvieron.

- Enfoques Tempranos y Basados en Reglas/Diccionarios: Describe los métodos más antiguos y cómo se hizo la transición a ML simple. 

- Aplicaciones Iniciales de Machine Learning Tradicional: ¿Cómo se usaron SVM, Naive Bayes, etc.? ¿Qué tipo de features (TF-IDF, n-grams) se usaban con ellos? (Describe el uso de las features, no la explicación matemática de TF-IDF).

- Integración de Word Embeddings y Modelos Neuronales Simples: Describe el impacto de los embeddings y cómo se combinaron con CNNs o RNNs básicas.

- Avances con LSTMs, GRUs y Mecanismos de Atención: Describe la aplicación de arquitecturas neuronales más avanzadas para capturar dependencias complejas.

- El Paradigma de los Modelos Pre-entrenados (Transformers): Describe cómo modelos como BERT y sus variantes se aplican mediante fine-tuning para lograr resultados de vanguardia.
* Dentro de cada sub-sección, menciona los modelos específicos aplicados, los datasets clave utilizados en esos trabajos particulares, las métricas reportadas y los resultados obtenidos. Compara y contrasta si los artículos lo permiten.

- Datasets y Desafíos Asociados a los Datos
* Discute los principales datasets que aparecen en la literatura revisada.
* Señala las características importantes de estos datasets (fuente, idioma, tamaño, esquema de etiquetado).
* Enfócate en los desafíos inherentes a los datos para este problema: el desbalance de clases (un punto muy importante), la subjetividad de la anotación, la calidad de los datos, la evolución del lenguaje, la necesidad de datos en diversos idiomas, etc.

- Métricas y Metodologías de Evaluación en la Literatura
* Describe cómo se mide el rendimiento de los modelos en los estudios revisados.
* Explica la importancia de las métricas adecuadas (Precision, Recall, F1-score, AUC) dado el problema del desbalance de clases. ¿Por qué Accuracy no es suficiente?
* Menciona si hay enfoques de evaluación estandarizados o comparativas comunes.

- Desafíos Persistentes y Limitaciones de los Enfoques Existentes (El "Por Qué Aún No Está Resuelto")
* Esta sección es CRUCIAL para justificar tu propuesta.
* Sintetiza las limitaciones y dificultades que han enfrentado los investigadores a pesar de los avances técnicos.
* Revisa los desafíos ya mencionados en el punto anterior y amplía otros: la detección de sarcasmo/ironía, el discurso de odio implícito vs. explícito, la generalización a nuevos dominios/plataformas, los problemas de sesgo en los modelos, la explicabilidad de los resultados, los desafíos de implementación en tiempo real.
* Presenta estos desafíos como brechas en la investigación existente.

-Conclusiones del Capítulo
* Resume brevemente los hallazgos clave de la revisión: la trayectoria del campo, las técnicas más destacadas, el estado actual, y reitera los principales desafíos y las oportunidades de investigación.
* Concluye indicando que el siguiente capítulo (Marco Teórico) proporcionará los fundamentos teóricos necesarios para comprender las bases de estos enfoques y la metodología a seguir.
---
Soy estudiante de la universidad central de la UCV, estoy haciendo mi semario de Inteligencia artificial, sobre la deteccion del discurso de odio con Machine Learning, que va a tener 4 capitulos (Estado del arte, Marco Teorico, Marco Metodologico y Propuesta Trabajo Especial de Grado), necesito que realices el primer capitulo el cual es el estado del arte, donde se estara estudiando como se estuvo haciendo la deteccion del discurso de odio con ML a lo largo del tiempo hasta la fecha, que tecnicas se usaron, modelos, sus metricas, desafios entre otros. ¿Qué técnicas se usaban antes del auge del Machine Learning moderno?
¿Cuáles fueron los primeros enfoques de Machine Learning aplicados al problema? (Probablemente modelos como SVM, Naive Bayes, Regresión Logística, KNN, SGDClassifier, Random Forest), ¿Cuales son los enfoques mas actuales?. Representación del Texto, Datasets Utilizados.


Aquí tienes una estructura para el Capítulo 1 (Estado del Arte):

- Evolución de los Enfoques Metodológicos (El "Cómo se ha Hecho")
* Esta es la sección principal donde describes la trayectoria de la investigación.
* No necesitas explicar qué es un SVM o un Transformer aquí (eso va en el Marco Teórico). En cambio, describe cómo se aplicaron al problema de la detección de discurso de odio y qué resultados se obtuvieron.

- Enfoques Tempranos y Basados en Reglas/Diccionarios: Describe los métodos más antiguos y cómo se hizo la transición a ML simple. 

- Aplicaciones Iniciales de Machine Learning Tradicional: ¿Cómo se usaron SVM, Naive Bayes, etc.? ¿Qué tipo de features (TF-IDF, n-grams) se usaban con ellos? (Describe el uso de las features, no la explicación matemática de TF-IDF).

- Integración de Word Embeddings y Modelos Neuronales Simples: Describe el impacto de los embeddings y cómo se combinaron con CNNs o RNNs básicas.

- Avances con LSTMs, GRUs y Mecanismos de Atención: Describe la aplicación de arquitecturas neuronales más avanzadas para capturar dependencias complejas.

- El Paradigma de los Modelos Pre-entrenados (Transformers): Describe cómo modelos como BERT y sus variantes se aplican mediante fine-tuning para lograr resultados de vanguardia.
* Dentro de cada sub-sección, menciona los modelos específicos aplicados, los datasets clave utilizados en esos trabajos particulares, las métricas reportadas y los resultados obtenidos. Compara y contrasta si los artículos lo permiten.

- Datasets y Desafíos Asociados a los Datos
* Discute los principales datasets que aparecen en la literatura revisada.
* Señala las características importantes de estos datasets (fuente, idioma, tamaño, esquema de etiquetado).
* Enfócate en los desafíos inherentes a los datos para este problema: el desbalance de clases (un punto muy importante), la subjetividad de la anotación, la calidad de los datos, la evolución del lenguaje, la necesidad de datos en diversos idiomas, etc.

- Métricas y Metodologías de Evaluación en la Literatura
* Describe cómo se mide el rendimiento de los modelos en los estudios revisados.
* Explica la importancia de las métricas adecuadas (Precision, Recall, F1-score, AUC) dado el problema del desbalance de clases. ¿Por qué Accuracy no es suficiente?
* Menciona si hay enfoques de evaluación estandarizados o comparativas comunes.

- Desafíos Persistentes y Limitaciones de los Enfoques Existentes (El "Por Qué Aún No Está Resuelto")
* Esta sección es CRUCIAL para justificar tu propuesta.
* Sintetiza las limitaciones y dificultades que han enfrentado los investigadores a pesar de los avances técnicos.
* Revisa los desafíos ya mencionados en el punto anterior y amplía otros: la detección de sarcasmo/ironía, el discurso de odio implícito vs. explícito, la generalización a nuevos dominios/plataformas, los problemas de sesgo en los modelos, la explicabilidad de los resultados, los desafíos de implementación en tiempo real.
* Presenta estos desafíos como brechas en la investigación existente.

-Conclusiones del Capítulo
* Resume brevemente los hallazgos clave de la revisión: la trayectoria del campo, las técnicas más destacadas, el estado actual, y reitera los principales desafíos y las oportunidades de investigación.
* Concluye indicando que el siguiente capítulo (Marco Teórico) proporcionará los fundamentos teóricos necesarios para comprender las bases de estos enfoques y la metodología a seguir.
---
Capítulo 1: Estado del Arte - Detección del Discurso de Odio con Machine Learning- Evolución de los Enfoques Metodológicos (El "Cómo se ha Hecho")

Enfoques Tempranos y Basados en Reglas/Diccionarios: Describe los métodos más antiguos y cómo se hizo la transición a ML simple.Antes de la generalización del aprendizaje automático, la detección del discurso de odio se basaba principalmente en sistemas basados en reglas y diccionarios de términos ofensivos.1 Estos enfoques iniciales implicaban la creación manual de listas de palabras clave y patrones que se consideraban indicativos de discurso de odio.3 Por ejemplo, un sistema podía marcar cualquier texto que contuviera insultos específicos o términos despectivos.2 Estos sistemas ofrecían la ventaja de ser intuitivos y personalizables 4, lo que facilitaba a los humanos la comprensión de por qué se señalaba cierto contenido.7 También podían adaptarse a tipos específicos de discurso de odio mediante la adición de palabras clave relevantes.1 La sencillez de estos sistemas permitía un control directo sobre el proceso de detección. Si un término específico se consideraba odioso, podía añadirse inmediatamente al diccionario. Esta correspondencia directa entre las palabras clave y la clasificación hacía que la lógica del sistema fuera transparente.
Sin embargo, estos métodos presentaban limitaciones significativas.3 A menudo eran frágiles y carecían de la flexibilidad necesaria para manejar los matices del lenguaje, como el sarcasmo, la ironía o las palabras clave utilizadas para evadir la detección.8 Los usuarios podían sortear fácilmente estos sistemas deletreando mal las palabras o utilizando sinónimos.2 La naturaleza estática de los diccionarios y las reglas los hacía susceptibles a la naturaleza evolutiva del discurso de odio.9 Con el tiempo surgen nuevos insultos y expresiones de odio, lo que requiere actualizaciones manuales constantes del sistema.11 El lenguaje es dinámico y el discurso de odio se adapta para evitar la censura. Los sistemas basados en reglas, que se basan en patrones predefinidos, tienen dificultades para seguir el ritmo de esta evolución. La necesidad de una intervención humana continua para actualizar estas reglas hace que el proceso sea ineficiente y potencialmente incompleto.
Además, estos sistemas a menudo sufrían de baja precisión, marcando como discurso de odio lenguaje ofensivo o incluso texto neutral que contenía las palabras clave, sin considerar el contexto.5 El contexto es crucial para determinar si un fragmento de texto constituye discurso de odio.5 Los sistemas basados en reglas, que se centran únicamente en la presencia de ciertas palabras, a menudo no tienen en cuenta las palabras circundantes y la intención general del mensaje.5 Una palabra que se considera un insulto en un contexto puede utilizarse de forma inocua o incluso ser reclamada por el grupo al que se dirige en otro.9 Los sistemas basados en reglas carecen de la comprensión semántica para diferenciar estos casos, lo que lleva a clasificaciones inexactas.


Aplicaciones Iniciales de Machine Learning Tradicional: ¿Cómo se usaron SVM, Naive Bayes, etc.? ¿Qué tipo de features (TF-IDF, n-grams) se usaban con ellos? (Describe el uso de las features, no la explicación matemática de TF-IDF).Las limitaciones de los sistemas basados en reglas llevaron a la adopción de los primeros modelos de aprendizaje automático para la detección del discurso de odio.1 Algoritmos como las Máquinas de Vectores de Soporte (SVM), Naive Bayes y la Regresión Logística fueron de los primeros en aplicarse a este problema.13 Estos modelos ofrecían la ventaja de aprender patrones a partir de los datos, lo que potencialmente les permitía capturar formas más matizadas de discurso de odio en comparación con los rígidos sistemas basados en reglas.1 En lugar de depender de reglas explícitas, estos modelos de ML podían aprender las relaciones estadísticas entre las palabras y la etiqueta de discurso de odio a partir de un conjunto de datos de entrenamiento. Este enfoque basado en datos permitía una detección más adaptativa y potencialmente más precisa.
Estos modelos tradicionalmente dependían de técnicas de ingeniería de características para convertir el texto en representaciones numéricas que los algoritmos pudieran procesar.5 Dos métodos comunes de extracción de características fueron la Frecuencia de Término-Frecuencia Inversa de Documento (TF-IDF) y los n-gramas.5 El TF-IDF se utilizaba para ponderar la importancia de las palabras en un documento en relación con una colección de documentos. Las palabras que aparecían con frecuencia en un texto específico pero raramente en otros se consideraban más significativas para la clasificación.5 Por ejemplo, los insultos de odio específicos probablemente tendrían una puntuación TF-IDF alta en los textos de discurso de odio.17 Los n-gramas implicaban considerar secuencias de n palabras (o caracteres) como características.5 Los unigramas (palabras individuales), los bigramas (secuencias de dos palabras) y los trigramas (secuencias de tres palabras) se utilizaban a menudo para capturar cierta información contextual.5 Por ejemplo, el bigrama "I hate" seguido de un grupo específico podría ser un fuerte indicador de discurso de odio.13
SVM, por ejemplo, se utilizaba con características TF-IDF y n-gramas para encontrar un hiperplano óptimo que separara el discurso de odio del que no lo es.7 Los estudios mostraron resultados prometedores, con SVM a menudo superando a otros modelos tradicionales de ML en términos de precisión y puntuación F1.13 Por ejemplo, un estudio encontró que las características de bigramas combinadas con SVM alcanzaron una precisión del 79%.13 Otro estudio que utilizaba TF-IDF con un modelo SGD logró una alta precisión del 98,21% en el discurso de odio en árabe.17 Naive Bayes, un clasificador probabilístico, también se aplicó, a menudo con características TF-IDF, para predecir la probabilidad de que un texto perteneciera a la clase de discurso de odio.13 Algunos estudios informaron de un buen rendimiento con Naive Bayes, alcanzando precisiones en torno al 87%.12 La regresión logística, un modelo lineal, fue otro enfoque temprano, a menudo utilizado con características de n-gramas.14 Proporcionaba una puntuación de probabilidad para la clasificación y era relativamente fácil de interpretar.14 Un estudio que utilizaba la regresión logística con n-gramas logró una puntuación F1 de 0,824.22 El rendimiento de estos primeros modelos de ML dependía en gran medida de la calidad de las características diseñadas.13 La elaboración de características eficaces requería experiencia en el dominio y una cuidadosa experimentación.5 La capacidad de estos modelos para detectar el discurso de odio estaba limitada por lo bien que las características artesanales podían capturar los patrones complejos y los matices del lenguaje odioso. Si las características no eran exhaustivas o no representaban información contextual importante, el rendimiento del modelo se vería afectado.


Integración de Word Embeddings y Modelos Neuronales Simples: Describe el impacto de los embeddings y cómo se combinaron con CNNs o RNNs básicas.La introducción de los word embeddings marcó un avance significativo en la representación textual para la detección del discurso de odio.10 Los word embeddings, como Word2Vec, GloVe y FastText, aprendieron representaciones vectoriales densas de las palabras basándose en su contexto en grandes cantidades de datos de texto.10 Las palabras semánticamente similares estaban representadas por vectores cercanos entre sí en el espacio de embedding.10 Los word embeddings permitieron a los modelos capturar relaciones semánticas entre palabras, yendo más allá del enfoque de bolsa de palabras de TF-IDF y n-gramas.10 Esto permitió a los modelos comprender mejor el significado y la intención detrás del texto.19 A diferencia de TF-IDF, que trata las palabras como entidades independientes, los word embeddings capturan el significado contextual de las palabras. Esto significa que un modelo que utiliza word embeddings podría entender potencialmente que "estúpido" e "idiota" son similares en significado y que ambos podrían utilizarse en contextos odiosos.
Estos word embeddings se integraron entonces con arquitecturas de redes neuronales simples como las Redes Neuronales Convolucionales (CNN) y las Redes Neuronales Recurrentes (RNN) para la clasificación del discurso de odio.23 Las CNN, inicialmente populares en visión por computador, se adaptaron para tareas de PNL tratando el texto como una secuencia unidimensional.23 Utilizaban filtros convolucionales para aprender patrones locales de palabras que eran indicativos de discurso de odio.27 Por ejemplo, una CNN podría aprender a reconocer frases odiosas específicas o combinaciones de palabras.28 Los estudios demostraron que las CNN combinadas con word embeddings podían lograr un buen rendimiento, y un estudio informó de una puntuación F1 macro ponderada de 0,66 con word embeddings de GloVe.25 Las RNN, en particular las redes de memoria a corto plazo (LSTM) y las unidades recurrentes cerradas (GRU), se diseñaron para procesar datos secuenciales y podían capturar dependencias entre palabras en una frase.23 Las LSTM y las GRU podían recordar información de partes anteriores de la frase, lo que les permitía comprender mejor el contexto.27 Un estudio que utilizaba word embeddings específicos del dominio con un modelo BiLSTM logró una puntuación F1 del 93%.10 La combinación de word embeddings con redes neuronales permitió a los modelos aprender automáticamente características relevantes de los datos de texto, lo que redujo la necesidad de una extensa ingeniería manual de características.23 En lugar de depender de los humanos para definir qué características son importantes, estas redes neuronales podían aprender las representaciones óptimas directamente de los datos. Este enfoque de aprendizaje de extremo a extremo tenía el potencial de descubrir patrones más complejos y sutiles en el discurso de odio.


Avances con LSTMs, GRUs y Mecanismos de Atención: Describe la aplicación de arquitecturas neuronales más avanzadas para capturar dependencias complejas.Para capturar dependencias más complejas y de largo alcance en el texto, los investigadores comenzaron a utilizar arquitecturas de redes neuronales recurrentes más avanzadas, como las LSTM y las GRU, con mecanismos de atención.29 Las LSTM y las GRU se desarrollaron aún más para abordar el problema de la desaparición del gradiente en las RNN básicas, lo que les permitió recordar información durante secuencias de palabras más largas.23 Esto fue crucial para comprender el contexto en publicaciones de redes sociales más largas.27 Los mecanismos de atención permitieron al modelo ponderar la importancia de diferentes palabras en la secuencia de entrada al realizar una predicción.29 Esto significaba que el modelo podía centrarse en las partes más relevantes del texto al determinar si contenía discurso de odio.29 Por ejemplo, en una frase como "Odio a todos estos [término ofensivo para un grupo]", el mecanismo de atención probablemente se centraría en "odio" y el término ofensivo.
Los estudios demostraron que las LSTM y las GRU con atención superaban a las redes neuronales más simples y a los modelos tradicionales de ML.29 Por ejemplo, un estudio propuso una red neuronal LSTM+MLP que logró un AUC de 0,828 en un conjunto de datos de discurso de odio en español.7 Otro estudio que utilizaba BiLSTMs con atención informó de buenos resultados en la detección de discurso de odio en urdu romano.35 Los mecanismos de atención mejoraron significativamente la capacidad de las redes recurrentes para manejar secuencias largas y centrarse en las palabras más importantes para la clasificación.29 Al permitir que el modelo atienda selectivamente a diferentes partes del texto de entrada, los mecanismos de atención permitieron al modelo comprender mejor el contexto e identificar señales sutiles de discurso de odio que podrían pasar desapercibidas si el texto se procesara simplemente de forma secuencial.


El Paradigma de los Modelos Pre-entrenados (Transformers): Describe cómo modelos como BERT y sus variantes se aplican mediante fine-tuning para lograr resultados de vanguardia.La llegada de los modelos basados en transformadores, como BERT, RoBERTa y sus variantes, revolucionó el campo de la detección del discurso de odio.10 Estos modelos se basan en la arquitectura del transformador, que utiliza mecanismos de autoatención para comprender el contexto de las palabras en una frase considerando todas las demás palabras simultáneamente.39 Los modelos de transformadores sobresalen en la captura de dependencias de largo alcance y en la comprensión del contexto de las palabras de una manera que las arquitecturas anteriores tenían dificultades.39 Esta profunda comprensión contextual es crucial para detectar con precisión el discurso de odio, que a menudo se basa en señales sutiles y significados implícitos.43 A diferencia de las RNN que procesan el texto secuencialmente, los transformadores pueden procesar todas las palabras de una frase a la vez, lo que les permite aprender directamente las relaciones entre las palabras independientemente de su distancia en la frase. Esto es particularmente beneficioso para comprender frases complejas donde el significado depende de palabras que están muy separadas.
El enfoque típico para aplicar estos modelos a la detección del discurso de odio es mediante el ajuste fino. Los modelos de transformadores preentrenados, que han sido entrenados en grandes cantidades de datos de texto, se adaptan a la tarea específica de clasificación del discurso de odio utilizando conjuntos de datos etiquetados de discurso de odio.36 Este enfoque de aprendizaje por transferencia permite a estos modelos lograr resultados de vanguardia con cantidades relativamente pequeñas de datos específicos de la tarea.39 El preentrenamiento en grandes corpus proporciona a los modelos de transformadores una sólida comprensión del lenguaje general, que luego puede transferirse eficazmente a la tarea de detección del discurso de odio mediante el ajuste fino.39 La fase de preentrenamiento permite al modelo aprender patrones y representaciones lingüísticas generales. El ajuste fino adapta entonces estas representaciones generales a las características específicas del discurso de odio, lo que lleva a un alto rendimiento incluso con datos etiquetados limitados para la tarea del discurso de odio.
Los estudios han demostrado consistentemente que los modelos de transformadores superan a los enfoques anteriores en varios puntos de referencia de detección de discurso de odio.35 Por ejemplo, BERT y sus variantes han logrado alta precisión y puntuaciones F1 en conjuntos de datos en múltiples idiomas.35 Los métodos de conjunto que combinan múltiples modelos de transformadores también han mostrado resultados prometedores.36 El éxito de los modelos de transformadores los ha convertido en el paradigma dominante en la investigación de la detección del discurso de odio.9 Los investigadores continúan explorando diferentes arquitecturas de transformadores, estrategias de preentrenamiento y técnicas de ajuste fino para mejorar aún más el rendimiento y abordar los desafíos restantes.37 El campo está en constante evolución con nuevos modelos y técnicas basados en transformadores que se están desarrollando. Esta investigación en curso tiene como objetivo abordar las limitaciones de los modelos actuales, como el sesgo, la falta de explicabilidad y la dificultad para detectar formas sutiles de discurso de odio.

- Datasets y Desafíos Asociados a los Datos

Discute los principales datasets que aparecen en la literatura revisada.


Señala las características importantes de estos datasets (fuente, idioma, tamaño, esquema de etiquetado).


Enfócate en los desafíos inherentes a los datos para este problema: el desbalance de clases (un punto muy importante), la subjetividad de la anotación, la calidad de los datos, la evolución del lenguaje, la necesidad de datos en diversos idiomas, etc.Se han creado numerosos conjuntos de datos para la investigación sobre la detección del discurso de odio.24 Estos conjuntos de datos varían significativamente en su fuente (por ejemplo, Twitter, Facebook, YouTube, Reddit, foros en línea) 5, idioma (principalmente inglés, pero también alemán, español, árabe, hindi, etc.) 44, tamaño (desde unos pocos miles hasta millones de publicaciones) 5 y esquemas de etiquetado (binario: odio/no odio; multiclase: odio, ofensivo, normal; o categorías más detalladas).5 Algunos conjuntos de datos destacados incluyen el Conjunto de Datos para la Identificación de Lenguaje Ofensivo (OLID) 73, HASOC (Identificación de Discurso de Odio y Contenido Ofensivo en Lenguas Indo-Europeas) 42 y los conjuntos de datos de Waseem y Hovy.88 La diversidad de conjuntos de datos refleja la naturaleza multifacética del discurso de odio y los diferentes contextos en los que se manifiesta.69 Sin embargo, esta diversidad también plantea desafíos para comparar el rendimiento de diferentes modelos y generalizar los hallazgos entre plataformas e idiomas.56 Los modelos entrenados en un conjunto de datos pueden no funcionar bien en otro debido a las diferencias en la definición de discurso de odio, los grupos objetivo, el idioma utilizado y la forma en que se recopilaron y anotaron los datos. Esta falta de estandarización dificulta la evaluación del verdadero progreso en el campo.
Un desafío importante asociado con estos conjuntos de datos es el desequilibrio de clases, donde el número de instancias de discurso de odio es típicamente mucho menor que el número de instancias de discurso no odioso.5 Este desequilibrio puede llevar a modelos que están sesgados hacia la clase mayoritaria y que tienen un rendimiento deficiente en la detección del discurso de odio real.8 El desequilibrio de clases es un problema crítico que debe abordarse para construir modelos eficaces de detección del discurso de odio.69 La precisión por sí sola no es una métrica suficiente en tales casos, ya que un modelo que siempre predice "no discurso de odio" podría lograr una alta precisión si el desequilibrio es severo.9 Cuando la clase mayoritaria supera significativamente a la minoritaria, un modelo puede lograr una alta precisión simplemente aprendiendo a predecir la clase mayoritaria la mayor parte del tiempo. Esto no significa que el modelo sea bueno para detectar la clase minoritaria (discurso de odio), que es el objetivo principal. Por lo tanto, métricas como la precisión, la exhaustividad y la puntuación F1 son más importantes para evaluar el rendimiento en conjuntos de datos desequilibrados.34
La anotación del discurso de odio también es muy subjetiva, lo que lleva a inconsistencias entre los anotadores y entre los conjuntos de datos.5 Lo que una persona considera discurso de odio, otra podría verlo como ofensivo o incluso aceptable.5 La naturaleza subjetiva de la anotación del discurso de odio dificulta el establecimiento de una verdad fundamental consistente y puede introducir sesgos en los conjuntos de datos.51 Esto puede afectar la fiabilidad y la generalización de los modelos entrenados con dichos datos.98 Los antecedentes personales, los contextos culturales y las interpretaciones de las directrices de los anotadores pueden influir en la forma en que etiquetan el contenido. Esta variabilidad en la anotación puede conducir a conjuntos de datos ruidosos y a modelos que aprenden estos sesgos en lugar de las características subyacentes del discurso de odio.
La calidad de los datos también puede ser un desafío, ya que el texto de las redes sociales a menudo contiene gramática no estándar, errores ortográficos y abreviaturas.11 El lenguaje utilizado en línea también está en constante evolución, con nuevas jergas y expresiones que surgen con frecuencia.9 La naturaleza dinámica y a menudo informal del lenguaje en línea dificulta que los modelos entrenados en conjuntos de datos estáticos se mantengan al día con las últimas formas de discurso de odio.9 Las técnicas de normalización textual pueden ayudar a abordar algunos de estos problemas.91 Los perpetradores de discurso de odio a menudo adaptan su lenguaje para evadir la detección, utilizando nuevos términos, abreviaturas y palabras escritas intencionalmente de forma incorrecta. Los modelos deben ser robustos a estas variaciones y actualizarse continuamente para reconocer los patrones emergentes.
Existe una necesidad significativa de conjuntos de datos de discurso de odio en diversos idiomas para abordar la naturaleza global del problema.15 La mayoría de las investigaciones y los conjuntos de datos disponibles públicamente están en inglés, lo que lleva a modelos que pueden no ser efectivos en otros contextos lingüísticos.15 Se están explorando enfoques multilingües y modelos multilingües para abordar este desafío.33 El enfoque predominantemente en inglés de la investigación actual crea un sesgo lingüístico y limita la aplicabilidad de los modelos desarrollados a otros idiomas y culturas.80 El desarrollo de recursos y modelos para idiomas con pocos recursos es un área crucial para futuras investigaciones.15 El discurso de odio es un fenómeno global, y la detección eficaz requiere modelos que puedan comprender y procesar texto en varios idiomas. Los enfoques multilingües tienen como objetivo transferir el conocimiento aprendido de un idioma a otro, especialmente para los idiomas con datos etiquetados limitados.
Tabla 1: Características de los Principales Conjuntos de Datos

Nombre del DatasetFuenteIdioma(s)Tamaño (Instancias)Esquema de EtiquetadoCaracterísticas NotablesOLIDTwitterInglés> 14,000Ofensivo/No, Dirigido/No, Individuo/Grupo/OtroAnotación JerárquicaHASOCTwitter, FacebookInglés, Hindi, Alemán> 5,000 por idiomaOdio/No, Ofensivo, ProfanoMultilingüeWaseem y HovyTwitterInglés~ 16,000Sexista, Racista, NingunoSesgo de Usuario- Métricas y Metodologías de Evaluación en la Literatura

Describe cómo se mide el rendimiento de los modelos en los estudios revisados.


Explica la importancia de las métricas adecuadas (Precision, Recall, F1-score, AUC) dado el problema del desbalance de clases. ¿Por qué Accuracy no es suficiente?


Menciona si hay enfoques de evaluación estandarizados o comparativas comunes.El rendimiento de los modelos de detección del discurso de odio se evalúa típicamente utilizando varias métricas.5 Las métricas comunes incluyen la Precisión (Accuracy), la Exactitud (Precision), la Exhaustividad (Recall), la Puntuación F1 (F1-score) y el Área Bajo la Curva Característica Operativa del Receptor (AUC).5 La Precisión mide la corrección general de las predicciones del modelo (la proporción de instancias clasificadas correctamente con respecto al número total de instancias).34 La Exactitud mide la proporción de instancias de discurso de odio identificadas correctamente entre todas las instancias clasificadas como discurso de odio (minimizando los falsos positivos).34 La Exhaustividad mide la proporción de instancias reales de discurso de odio que fueron identificadas correctamente por el modelo (minimizando los falsos negativos).34 La Puntuación F1 es la media armónica de la exactitud y la exhaustividad, lo que proporciona una medida equilibrada del rendimiento del modelo, especialmente útil cuando se trata de conjuntos de datos desequilibrados.34 El AUC representa el área bajo la curva ROC, que traza la tasa de verdaderos positivos (exhaustividad) contra la tasa de falsos positivos en varios ajustes de umbral.34 Proporciona una medida general de la capacidad del modelo para discriminar entre las dos clases.
Dado el significativo desequilibrio de clases en los conjuntos de datos de detección de discurso de odio, la precisión por sí sola a menudo no es una métrica suficiente para evaluar el rendimiento del modelo.8 Un modelo que simplemente predice la clase mayoritaria (no discurso de odio) la mayor parte del tiempo puede lograr una alta precisión, pero no detecta las instancias reales de discurso de odio.9 La exactitud y la exhaustividad son cruciales en tareas de clasificación desequilibradas como la detección del discurso de odio porque se centran en la capacidad del modelo para identificar correctamente la clase minoritaria (discurso de odio), que es el objetivo principal.34 La puntuación F1 proporciona un buen equilibrio entre estas dos métricas.34 En la detección del discurso de odio, no identificar un mensaje de odio (falso negativo) puede tener graves consecuencias. La exhaustividad ayuda a medir la capacidad del modelo para evitar tales fallos. Por otro lado, señalar incorrectamente un mensaje inofensivo como odioso (falso positivo) también puede ser problemático, lo que lleva a la censura del discurso legítimo. La exactitud mide la capacidad del modelo para evitar estos errores. La puntuación F1 combina estos dos aspectos importantes en una sola métrica.
La literatura no muestra un enfoque completamente estandarizado para la evaluación, pero el uso de las métricas mencionadas (Exactitud, Exhaustividad, Puntuación F1, AUC) es común en muchos estudios.5 Algunas tareas compartidas y conjuntos de datos de referencia, como OffensEval y HASOC, proporcionan marcos de evaluación comunes y permiten la comparación entre diferentes enfoques.42 Estas iniciativas ayudan a impulsar el progreso en el campo al establecer objetivos y métricas comunes, facilitando una evaluación más objetiva de diferentes técnicas e identificando las direcciones más prometedoras para futuras investigaciones.
Tabla 2: Métricas de Evaluación Comunes

MétricaDescripciónImportancia en la Detección del Discurso de Odio (especialmente para datos desequilibrados)PrecisiónProporción de instancias clasificadas correctamente como odio del total clasificadas como odio.Importante para minimizar los falsos positivos (marcar erróneamente contenido no odioso).ExhaustividadProporción de instancias de odio reales que fueron identificadas correctamente.Crucial para minimizar los falsos negativos (no detectar contenido odioso).Puntuación F1Media armónica de la precisión y la exhaustividad.Proporciona una medida equilibrada del rendimiento, útil para datos desequilibrados.AUCÁrea bajo la curva ROC, que mide la capacidad de discriminación del modelo.Ofrece una visión general de la capacidad del modelo para distinguir entre clases.- Desafíos Persistentes y Limitaciones de los Enfoques Existentes (El "Por Qué Aún No Está Resuelto")

Esta sección es CRUCIAL para justificar tu propuesta.


Sintetiza las limitaciones y dificultades que han enfrentado los investigadores a pesar de los avances técnicos.


Revisa los desafíos ya mencionados en el punto anterior y amplía otros: la detección de sarcasmo/ironía, el discurso de odio implícito vs. explícito, la generalización a nuevos dominios/plataformas, los problemas de sesgo en los modelos, la explicabilidad de los resultados, los desafíos de implementación en tiempo real.


Presenta estos desafíos como brechas en la investigación existente.A pesar de los importantes avances en la detección del discurso de odio mediante el aprendizaje automático, persisten varios desafíos y limitaciones.5 Detectar el sarcasmo y la ironía en el texto sigue siendo un obstáculo importante.11 Los modelos a menudo tienen dificultades para distinguir entre el discurso de odio genuino y las declaraciones sarcásticas o irónicas que pueden parecer odiosas en la superficie, pero tienen una intención subyacente diferente.11 La capacidad de comprender el lenguaje figurado como el sarcasmo y la ironía es crucial para la detección precisa del discurso de odio.127 Los modelos actuales a menudo carecen del razonamiento de sentido común y la comprensión contextual necesarios para esta tarea.80 El sarcasmo y la ironía a menudo se basan en un contraste entre el significado literal de las palabras y el significado pretendido. Detectar esto requiere comprender el tono, el contexto y potencialmente la intención del hablante o autor, lo cual es un desafío complejo para la IA.
Distinguir entre el discurso de odio explícito e implícito es otro desafío continuo.68 Mientras que el discurso de odio explícito utiliza insultos directos y lenguaje odioso, el discurso de odio implícito transmite una intención dañina de formas más sutiles o indirectas, a menudo basándose en estereotipos, insinuaciones o lenguaje codificado.68 El discurso de odio implícito es particularmente difícil de detectar, ya que a menudo carece de las señales léxicas obvias del discurso de odio explícito.68 Su detección requiere una comprensión más profunda del contexto social, los matices culturales y potencialmente el conocimiento histórico.131 El discurso de odio implícito a menudo explota los estereotipos y se basa en que el lector o el oyente haga inferencias dañinas. Detectar esto requiere que el modelo tenga cierto nivel de "sentido común" y la capacidad de comprender el significado implícito más allá de las palabras literales.
La generalización de los modelos de detección del discurso de odio a nuevos dominios y plataformas sigue siendo una limitación importante.5 Los modelos entrenados con datos de una plataforma de redes sociales pueden no funcionar bien con datos de otra plataforma debido a las diferencias en el comportamiento del usuario, los estilos de lenguaje y los tipos de discurso de odio prevalentes en cada plataforma.5 La generalización del dominio es un desafío crucial para las aplicaciones del mundo real de la detección del discurso de odio.5 El discurso de odio puede manifestarse de manera diferente en varios entornos en línea, y los modelos deben ser lo suficientemente robustos como para manejar estas variaciones.138 Las características del discurso de odio en una plataforma como Twitter, con su texto corto y el uso de hashtags, pueden ser diferentes de las de una plataforma como Facebook con publicaciones más largas y diferentes datos demográficos de los usuarios. Los modelos deben poder adaptarse a estas características específicas del dominio.
El sesgo en los modelos de detección del discurso de odio es una preocupación creciente.110 Los modelos entrenados con conjuntos de datos sesgados pueden marcar de manera desproporcionada el contenido de ciertos grupos demográficos como discurso de odio o no detectar el discurso de odio dirigido a otros grupos.110 Abordar el sesgo tanto en los conjuntos de datos como en los modelos es esencial para garantizar la equidad y prevenir daños no deseados.110 Esto requiere una atención cuidadosa a las prácticas de recopilación, anotación y entrenamiento de datos.110 Si un conjunto de datos contiene más instancias de discurso de odio dirigido a un grupo que a otro, o si los anotadores son más propensos a etiquetar el contenido de ciertos grupos como odioso, el modelo entrenado probablemente reflejará estos sesgos. Esto puede llevar a resultados injustos o discriminatorios.
La falta de explicabilidad en muchos modelos de aprendizaje profundo de vanguardia es otra limitación.5 Comprender por qué un modelo clasificó un fragmento de texto en particular como discurso de odio es importante para generar confianza en el sistema y para identificar y mitigar posibles sesgos.5 La Inteligencia Artificial Explicable (XAI) se está volviendo cada vez más importante en la investigación sobre la detección del discurso de odio.6 Las técnicas que pueden proporcionar información sobre el proceso de toma de decisiones del modelo son cruciales para mejorar la transparencia y la rendición de cuentas.6 Si un modelo clasifica un texto como discurso de odio, es importante comprender qué palabras o frases contribuyeron más a esta clasificación. Esto puede ayudar a identificar si el modelo se basa en indicadores legítimos de discurso de odio o si está captando correlaciones espurias o sesgos.
Finalmente, la implementación de modelos de detección del discurso de odio en tiempo real para manejar el enorme volumen de contenido en línea plantea desafíos significativos en términos de eficiencia computacional y escalabilidad.18 Los modelos deben ser lo suficientemente rápidos y eficientes para procesar y clasificar el contenido a medida que se genera.18 La detección del discurso de odio en tiempo real requiere un equilibrio entre la precisión del modelo y la eficiencia computacional.18 Los modelos complejos de aprendizaje profundo, aunque a menudo logran una alta precisión, pueden ser computacionalmente costosos y pueden no ser adecuados para la implementación en tiempo real en plataformas de alto rendimiento.18 Las plataformas de redes sociales generan grandes cantidades de datos cada segundo. Los sistemas de detección del discurso de odio deben poder procesar estos datos de forma rápida y precisa para ser eficaces. Esto a menudo implica concesiones entre la complejidad, la precisión y la velocidad del modelo.

Conclusiones: La investigación sobre la detección del discurso de odio con aprendizaje automático ha experimentado una evolución significativa, desde enfoques tempranos basados en reglas y diccionarios hasta el paradigma actual dominado por modelos de transformadores preentrenados. Si bien los avances técnicos han permitido lograr resultados notables en la identificación de contenido odioso, persisten desafíos fundamentales. La dificultad para detectar formas sutiles de discurso de odio, como el sarcasmo y la ironía, junto con la necesidad de distinguir entre el discurso explícito e implícito, subraya la complejidad inherente de la tarea. Además, la falta de generalización de los modelos a nuevos dominios y plataformas, los problemas de sesgo en los datos y los algoritmos, la necesidad de una mayor explicabilidad en las decisiones de los modelos y los desafíos de la implementación en tiempo real siguen siendo áreas activas de investigación. La diversidad de conjuntos de datos disponibles, aunque valiosa para explorar diferentes facetas del problema, también contribuye a la dificultad de comparar resultados y establecer estándares de evaluación uniformes. En última instancia, la detección eficaz y ética del discurso de odio requiere un enfoque multidisciplinario que considere no solo los avances técnicos en el aprendizaje automático y el procesamiento del lenguaje natural, sino también las complejidades sociales, culturales y lingüísticas del fenómeno.

---
Soy estudiante de la universidad central de la UCV, estoy haciendo mi semario de Inteligencia artificial, sobre la deteccion del discurso de odio con Machine Learning, que va a tener 4 capitulos (Estado del arte, Marco Teorico, Marco Metodologico y Propuesta Trabajo Especial de Grado), necesito que realices el primer capitulo el cual es el estado del arte, donde se estara estudiando como se estuvo haciendo la deteccion del discurso de odio con ML a lo largo del tiempo hasta la fecha, que tecnicas se usaron, como fue la evolucion de estas tecnicas, modelos, sus metricas, desafios entre otros. ¿Qué técnicas se usaban antes del auge del Machine Learning moderno?
¿Cuáles fueron los primeros enfoques de Machine Learning aplicados al problema? (Probablemente modelos como SVM, Naive Bayes, Regresión Logística, KNN, SGDClassifier, Random Forest), ¿Cuales son los enfoques mas actuales?. Representación del Texto, Datasets Utilizados.

---
Podrias hacer cuadros comparativos entre las tecnicas usas en la diferentes secciones:


Un cuadro para: Aplicaciones Iniciales de Machine Learning Tradicional


Otro para: Integración de Word Embeddings y Modelos Neuronales Simples


Otro para: Avances con LSTMs, GRUs y Mecanismos de Atención


Otro para: El Paradigma de los Modelos Pre-entrenados (Transformers).


El cuadro debe tener:


Técnica
Características
Modelos Comunes
Métricas y Resultados Notables

---

Soy estudiante de la universidad central de la UCV, estoy haciendo mi semario de Inteligencia artificial, sobre la deteccion del discurso de odio con Machine Learning, que va a tener 4 capitulos (Estado del arte, Marco Teorico, Marco Metodologico y Propuesta Trabajo Especial de Grado), necesito que hagas una busqueda extensa de articulos en arxiv y google scholar (mayoritariamente arvix), aproximadamente 20 articulos o mas, y poder realizar el primer capitulo el cual sera el estado del arte, donde se estara estudiando como se estuvo haciendo la deteccion del discurso de odio con Machine Learning a lo largo del tiempo hasta la fecha, haciendo una especie de revision historica desde las tecnicas que se usaban en los inicios hasta las tecnicas que estan en vanguardia en la actualidad.

Toda la investigacion debe estar respaldada por articulos cientificos.

Aquí tienes una estructura para el Capítulo 1 (Estado del Arte):

1.1 Introducción al Capítulo
* Reafirma el propósito del capítulo: presentar una revisión exhaustiva y crítica de la investigación existente sobre la detección automática de discurso de odio utilizando técnicas de Machine Learning.
* Indica que esta revisión servirá para contextualizar el problema, identificar las aproximaciones previas, sus logros y limitaciones, y justificar la necesidad de futuras investigaciones y la propuesta que se presentará en capítulos posteriores.

1.2 Definiciones y Terminología en la Literatura
* En lugar de dar tu definición de hate speech aquí (eso va en el Marco Teórico), discute cómo los investigadores en los artículos revisados definen y abordan el concepto.
* Señala la variabilidad en la terminología (hate speech, offensive language, abusive language) y en las definiciones operacionales utilizadas en los estudios. Esto muestra una comprensión profunda de la complejidad del problema.

1.3 Evolución de los Enfoques Metodológicos (El "Cómo se ha Hecho")
* Esta es la sección principal donde describes la trayectoria de la investigación.
* No necesitas explicar qué es un SVM o un Transformer aquí (eso va en el Marco Teórico). En cambio, describe cómo se aplicaron al problema de la detección de discurso de odio y qué resultados se obtuvieron.

1.3.1 Enfoques Tempranos y Basados en Reglas/Diccionarios 
* Describe los métodos más antiguos y cómo se hizo la transición a ML simple.

1.3.2 Aplicaciones Iniciales de Machine Learning Tradicional
* ¿Cómo se usaron SVM, Naive Bayes, Regresion Logistica, entre otros relevantes? 
* ¿Qué tipo de features (TF-IDF, n-grams) se usaban con ellos? 
(Describe el uso de las features, no la explicación matemática de TF-IDF).

1.3.3 Integración de Word Embeddings y Modelos Neuronales Simples
* Describe el impacto de los embeddings y cómo se combinaron con CNNs o RNNs básicas y que limitaciones tenian.

1.3.4 Avances con LSTMs, GRUs y Mecanismos de Atención
* Describe la aplicación de arquitecturas neuronales más avanzadas para capturar dependencias complejas y que mejoras implementan.

1.3.5 El Paradigma de los Modelos Pre-entrenados (Transformers)
*Describe cómo modelos como BERT y sus variantes se aplican mediante fine-tuning para lograr resultados de vanguardia.

NOTA: Dentro de cada sub-sección, menciona los modelos específicos aplicados, los datasets clave utilizados en esos trabajos particulares, las métricas reportadas y los resultados obtenidos. Compara y contrasta si los artículos lo permiten. Ademas realiza un cuadro comparativo en cada sub-seccion para comparar las diferentes tecnicas usadas.

1.4 Datasets y Desafíos Asociados a los Datos
* Discute los principales datasets que aparecen en la literatura revisada.
* Señala las características importantes de estos datasets (fuente, idioma, tamaño, esquema de etiquetado).
* Enfócate en los desafíos inherentes a los datos para este problema: el desbalance de clases (un punto muy importante), la subjetividad de la anotación, la calidad de los datos, la evolución del lenguaje, la necesidad de datos en diversos idiomas, etc.
* Ademas realiza un cuadro comparativo.

1.5 Métricas y Metodologías de Evaluación en la Literatura
* Describe cómo se mide el rendimiento de los modelos en los estudios revisados.
* Explica la importancia de las métricas adecuadas (Precision, Recall, F1-score, AUC) dado el problema del desbalance de clases. ¿Por qué Accuracy no es suficiente?
* Menciona si hay enfoques de evaluación estandarizados o comparativas comunes.

1.6 Desafíos Persistentes y Limitaciones de los Enfoques Existentes (El "Por Qué Aún No Está Resuelto")
* Esta sección es CRUCIAL para justificar tu propuesta.
* Sintetiza las limitaciones y dificultades que han enfrentado los investigadores a pesar de los avances técnicos.
* Revisa los desafíos ya mencionados en el punto anterior y amplía otros: la detección de sarcasmo/ironía, el discurso de odio implícito vs. explícito, la generalización a nuevos dominios/plataformas, los problemas de sesgo en los modelos, la explicabilidad de los resultados, los desafíos de implementación en tiempo real.
* Presenta estos desafíos como brechas en la investigación existente.


Realiza un informe detallado de cada uno de los puntos, el informe debe estar en un formato academico en español siguiendo las normas APA haciendo un uso correcto de las referencias y respetando la estructura






Ahora podrias hacer cuadros comparativos entre las tecnicas usas en la diferentes secciones:


Un cuadro para: 1.3.2 Machine Learning Tradicional 

Otro para: 1.3.3 Word Embeddings y Modelos Neuronales Simples


Otro para: 1.3.4 LSTMs, GRUs y Mecanismos de Atención

Otro para: 1.3.5 Modelos Pre-entrenados (Transformers como BERT, RoBERTa, LLMs)

Comparando asi las diferentes tecnicas en su correspondiente epoca, en vez de un solo cuadro general

Los cuadros deben tener:

Técnica
Características
Modelos Comunes
Métricas y Resultados Notables

Tambien podria incluir la referencia al estudio donde se sacaron tales resultados







-Conclusiones del Capítulo

* Resume brevemente los hallazgos clave de la revisión: la trayectoria del campo, las técnicas más destacadas, el estado actual, y reitera los principales desafíos y las oportunidades de investigación.

* Concluye indicando que el siguiente capítulo (Marco Teórico) proporcionará los fundamentos teóricos necesarios para comprender las bases de estos enfoques y la metodología a seguir.
---
Soy estudiante de la universidad central de la UCV, estoy haciendo mi semario de Inteligencia artificial, sobre la deteccion del discurso de odio con Machine Learning, que va a tener 4 capitulos (Estado del arte, Marco Teorico, Marco Metodologico y Propuesta Trabajo Especial de Grado), necesito que hagas una busqueda extensa de articulos en arxiv y google scholar (mayoritariamente arvix), aproximadamente 20 articulos, y poder realizar el primer capitulo el cual sera el estado del arte, donde se estara estudiando como se estuvo haciendo la deteccion del discurso de odio con Machine Learning a lo largo del tiempo hasta la fecha

Estos son los puntos ya realizados:

1.1 Introducción al Capítulo

1.2 Definiciones y Terminología en la Literatura

1.3 Evolución de los Enfoques Metodológicos (El "Cómo se ha Hecho")

1.3.1 Enfoques Tempranos y Basados en Reglas/Diccionarios

Ahora necesito que investigues el siguiente punto:

1.3.2 Aplicaciones Iniciales de Machine Learning Tradicional
* ¿Cómo se usaron SVM, Naive Bayes, Regresion Logistica, entre otros relevantes? (Centrate especificamente en articulos de modelos tradicionales de Machine Learning (como SVM, Naive Bayes, Regresión Logística, entre otros relevantes) en la detección del discurso de odio o lenguaje ofensivo, no tomes en cuentas tecnicas mas avanzadas como transformers o redes neuronales, mecanismo de atencion ni la Integración de Word Embeddings y Modelos Neuronales Simples ya que estas seran abordadas mas adelante.)
* ¿Cuales fueron sus mejoras con respecto a los enfoques anteriores?
* ¿Qué tipo de features (TF-IDF, n-grams) se usaban con ellos?
(Describe el uso de las features, no la explicación matemática de TF-IDF, esa parte se dejará para el marco teorico).
* ¿Que limitaciones tenian?
* ¿Cuales son los resultados de los estudios?  
* Realiza un cuadro comparativo con las distintas tecnicas puede tener los siguiete puntos: 
-Técnica
-Características
-Modelos Comunes
-Métricas y Resultados Notables
Añade tambien o trata de integrar una seccion donde se especifiquen los estudios que se usaron para obtener ese cuadro comparativo.

Tambien puedes añadir otros aspecto o puntos que consideres importantes en cuanto a las Aplicaciones Iniciales de Machine Learning Tradicional

Todo el informe debe estar basado en articulos cientificos, preferiblemente de arvix y google scholar, respetando las reglas APA y en idioma español.

---
Soy estudiante de la universidad central de la UCV, estoy haciendo mi semario de Inteligencia artificial, sobre la deteccion del discurso de odio con Machine Learning, que va a tener 4 capitulos (Estado del arte, Marco Teorico, Marco Metodologico y Propuesta Trabajo Especial de Grado), necesito que hagas una busqueda extensa de articulos en arxiv y google scholar (mayoritariamente arvix), aproximadamente 20 articulos, y poder realizar el primer capitulo el cual sera el estado del arte, donde se estara estudiando como se estuvo haciendo la deteccion del discurso de odio con Machine Learning a lo largo del tiempo hasta la fecha

Estos son los puntos ya realizados:

1.1 Introducción al Capítulo

1.2 Definiciones y Terminología en la Literatura

1.3 Evolución de los Enfoques Metodológicos (El "Cómo se ha Hecho")

1.3.1 Enfoques Tempranos y Basados en Reglas/Diccionarios

Ahora necesito que investigues el siguiente punto:

1.3.2 Aplicaciones Iniciales de Machine Learning Tradicional
* ¿Cómo se usaron SVM, Naive Bayes, Regresion Logistica, entre otros relevantes? (Centrate especificamente en articulos con tecnicas tradicionales de Machine Learning (como BoW, n-grams, TF-IDF con modelos como SVM, Naive Bayes, Regresión Logística, entre otros relevantes) en la detección del discurso de odio o lenguaje ofensivo, no tomes en cuentas tecnicas mas avanzadas como transformers o redes neuronales, mecanismo de atencion ni la Integración de Word Embeddings y Modelos Neuronales Simples ya que estas seran abordadas mas adelante.)
* ¿Qué tipo de features (BoW, n-grams, TF-IDF) se usaban con los modelos?
(Describe brevemente que son, sus diferencia y el uso de las features a modo de contexto para el lector, no la explicación matemática de TF-IDF o n-grams, esa parte se dejará para el marco teorico).
* ¿Cuales fueron sus mejoras con respecto a los enfoques anteriores?
* ¿Que limitaciones tenian?
* ¿Cuales son los resultados de los estudios?  
* Realiza un cuadro comparativo con las distintas tecnicas puede tener los siguiete puntos: 
-Técnica de Representación de Texto
-Características
-Modelo (hacerse la comparacion con varios modelos si es posible y existen los estudios para una misma tecnica)
-Métricas y Resultados Notables
Añade tambien o trata de integrar una seccion donde se especifiquen los estudios que se usaron para obtener ese cuadro comparativo.

Tambien puedes añadir otros aspecto o puntos que consideres importantes en cuanto a las Aplicaciones Iniciales de Machine Learning Tradicional
Todo el informe debe estar basado en articulos cientificos, preferiblemente de arvix y google scholar, respetando las reglas APA y en idioma español.

---
Soy estudiante de la universidad central de la UCV, estoy haciendo mi semario de Inteligencia artificial, sobre la deteccion del discurso de odio con Machine Learning, que va a tener 4 capitulos (Estado del arte, Marco Teorico, Marco Metodologico y Propuesta Trabajo Especial de Grado), necesito que hagas una busqueda extensa de articulos en arxiv y google scholar (mayoritariamente arvix), aproximadamente 20 articulos, y poder realizar el primer capitulo el cual sera el estado del arte, donde se estara estudiando como se estuvo haciendo la deteccion del discurso de odio con Machine Learning a lo largo del tiempo hasta la fecha

Estos son los puntos ya realizados en mi informe:

1.1 Introducción al Capítulo

1.2 Definiciones y Terminología en la Literatura

1.3 Evolución de los Enfoques Metodológicos (El "Cómo se ha Hecho")

1.3.1 Enfoques Tempranos y Basados en Reglas/Diccionarios

1.3.2 Aplicaciones Iniciales de Machine Learning Tradicional

1.3.2.2 Técnicas de Representación de Texto (Feature Engineering, Bag of Words (BoW), N-gramas y TF-IDF)

1.3.2.3 Modelos de Machine Learning Tradicionales Aplicados (Máquinas de Soporte Vectorial (SVM), Clasificador Bayesiano Ingenuo (Naive Bayes) y Regresión Logística (LR), a menudo complementados por otros modelos como Árboles de Decisión (Decision Trees), K-Nearest Neighbors (KNN) y Random Forests (RF))

1.3.2.4 Mejoras y Limitaciones de las Aplicaciones Iniciales de Machine Learning Tradicional

1.3.2.5 Cuadro Comparativo y Resultados Notables

Ahora necesito que investigues los siguiente puntos:

1.3.3 Integración de Word Embeddings y Modelos Neuronales Simples

* Describe el impacto de los embeddings (describe brevemente los embeddings sin dar un definicion extensa, ya que esta se hara en el marco teorico, en este punto no explores  mucho los mecanismos de atencion ni modelos mas avanzados, eso se dejara para el siguiente punto)
* Cómo se combinaron con CNNs o RNNs básicas
* Mejoras y Limitaciones (Tratando de crear un sutil enlace para el lector entre las aplicaciones anteriores y las siguiente: Avances con LSTMs, GRUs y Mecanismos de Atención)
* Realiza un cuadro comparativo con las distintas tecnicas puede tener los siguiete puntos: 
-Técnica
-Características
-Modelo (hacerse la comparacion con varios modelos si es posible y existen los estudios para una misma tecnica)
-Métricas y Resultados Notables
Añade tambien o trata de integrar una seccion donde se especifiquen los estudios que se usaron para obtener ese cuadro comparativo.

Tambien puedes añadir otros aspecto o puntos que consideres importantes en cuanto a Integración de Word Embeddings y Modelos Neuronales Simples

1.3.4 Avances con LSTMs, GRUs y Mecanismos de Atención

* Describe la aplicación de arquitecturas neuronales más avanzadas para capturar dependencias complejas
* Como se combinaron con modelos mas avanzados
* Mejoras y Limitaciones (Tratando de crear un sutil enlace para el lector entre las aplicaciones del puntos anterior y las siguiente: El Paradigma de los Modelos Pre-entrenados (Transformers))
* Realiza un cuadro comparativo con las distintas tecnicas puede tener los siguiete puntos: 
-Técnica
-Características
-Modelo (hacerse la comparacion con varios modelos si es posible y existen los estudios para una misma tecnica)
-Métricas y Resultados Notables
Añade tambien o trata de integrar una seccion donde se especifiquen los estudios que se usaron para obtener ese cuadro comparativo.

Tambien puedes añadir otros aspecto o puntos que consideres importantes en cuanto a Avances con LSTMs, GRUs y Mecanismos de Atención

1.3.5 El Paradigma de los Modelos Pre-entrenados (Transformers)

*Describe cómo modelos como BERT y sus variantes se aplican mediante fine-tuning para lograr resultados de vanguardia.
(Describe las tecnicas usado y los modelos, sin llegar a definiciones extensas, ya que eso se realizara en el capitulo del marco teorico)
* Mejoras y Limitaciones (Tratando de crear un sutil enlace para el lector entre las aplicaciones del puntos anterior y como llegaron a ser la vanguardia y que desafios experimientan para el futuro)
* Realiza un cuadro comparativo con las distintas tecnicas puede tener los siguiete puntos: 
-Técnica
-Características
-Modelo (hacerse la comparacion con varios modelos si es posible y existen los estudios para una misma tecnica)
-Métricas y Resultados Notables
Añade tambien o trata de integrar una seccion donde se especifiquen los estudios que se usaron para obtener ese cuadro comparativo.

Tambien puedes añadir otros aspecto o puntos que consideres importantes en cuanto a El Paradigma de los Modelos Pre-entrenados (Transformers)

Todo el informe debe estar basado en articulos cientificos, preferiblemente de arvix y google scholar, respetando las reglas APA y en idioma español.




1.3.2 Aplicaciones Iniciales de Machine Learning Tradicional
* ¿Cómo se usaron SVM, Naive Bayes, Regresion Logistica, entre otros relevantes? (Centrate especificamente en articulos con tecnicas tradicionales de Machine Learning (como BoW, n-grams, TF-IDF con modelos como SVM, Naive Bayes, Regresión Logística, entre otros relevantes) en la detección del discurso de odio o lenguaje ofensivo, no tomes en cuentas tecnicas mas avanzadas como transformers o redes neuronales, mecanismo de atencion ni la Integración de Word Embeddings y Modelos Neuronales Simples ya que estas seran abordadas mas adelante.)
* ¿Qué tipo de features (BoW, n-grams, TF-IDF) se usaban con los modelos?
(Describe brevemente que son, sus diferencia y el uso de las features a modo de contexto para el lector, no la explicación matemática de TF-IDF o n-grams, esa parte se dejará para el marco teorico).
* ¿Cuales fueron sus mejoras con respecto a los enfoques anteriores?
* ¿Que limitaciones tenian?
* ¿Cuales son los resultados de los estudios?  

---
Soy estudiante de la universidad central de la UCV, estoy haciendo mi semario de Inteligencia artificial, sobre la deteccion del discurso de odio con Machine Learning, que va a tener 4 capitulos (Estado del arte, Marco Teorico, Marco Metodologico y Propuesta Trabajo Especial de Grado), al final se debe proponer una solucion al problema la cual será desarrollada proximamente en la tesis.

La estructura hasta ahora de mi semanario en la siguiente, con el primer capitulo terminado:

Detección Automática de Discurso de Odio y Leguaje Ofensivo

Capítulo 1: Estado del Arte 

1.1 Introducción al Capítulo
* Reafirma el propósito del capítulo: presentar una revisión exhaustiva y crítica de la investigación existente sobre la detección automática de discurso de odio utilizando técnicas de Machine Learning.
* Indica que esta revisión servirá para contextualizar el problema, identificar las aproximaciones previas, sus logros y limitaciones, y justificar la necesidad de futuras investigaciones y la propuesta que se presentará en capítulos posteriores.

1.2 Definiciones y Terminología en la Literatura
* En lugar de dar tu definición de hate speech aquí (eso va en el Marco Teórico), discute cómo los investigadores en los artículos revisados definen y abordan el concepto.
* Señala la variabilidad en la terminología (hate speech, offensive language, abusive language) y en las definiciones operacionales utilizadas en los estudios. Esto muestra una comprensión profunda de la complejidad del problema.

1.3 Evolución de los Enfoques Metodológicos (El "Cómo se ha Hecho")
* Esta es la sección principal donde describes la trayectoria de la investigación.
* No necesitas explicar qué es un SVM o un Transformer aquí (eso va en el Marco Teórico). En cambio, describe cómo se aplicaron al problema de la detección de discurso de odio y qué resultados se obtuvieron.

1.3.1 Enfoques Tempranos y Basados en Reglas/Diccionarios 
* Describe los métodos más antiguos y cómo se hizo la transición a ML simple.

1.3.2 Aplicaciones Iniciales de Machine Learning Tradicional
* ¿Cómo se usaron SVM, Naive Bayes, Regresion Logistica, entre otros relevantes? (Se centra especificamente en articulos con tecnicas tradicionales de Machine Learning (como BoW, n-grams, TF-IDF con modelos como SVM, Naive Bayes, Regresión Logística, entre otros relevantes) en la detección del discurso de odio o lenguaje ofensivo.
* ¿Qué tipo de features (BoW, n-grams, TF-IDF) se usaban con los modelos?
(Describe el uso de las features con una breve descripcion, no la explicación matemática de TF-IDF o n-grams, esa parte se dejará para el marco teorico).
* ¿Cuales fueron sus mejoras con respecto a los enfoques anteriores?
* ¿Que limitaciones tenian?
* ¿Cuales son los resultados de los estudios? 

1.3.4 Avances con LSTMs, GRUs y Mecanismos de Atención
* Describe la aplicación de arquitecturas neuronales más avanzadas para capturar dependencias complejas y que mejoras implementan.

1.3.5 El Paradigma de los Modelos Pre-entrenados (Transformers)
*Describe cómo modelos como BERT y sus variantes se aplican mediante fine-tuning para lograr resultados de vanguardia.

1.4 Datasets y Desafíos Asociados a los Datos
* Discute los principales datasets que aparecen en la literatura revisada.
* Señala las características importantes de estos datasets (fuente, idioma, tamaño, esquema de etiquetado).
* Enfócate en los desafíos inherentes a los datos para este problema: el desbalance de clases (un punto muy importante), la subjetividad de la anotación, la calidad de los datos, la evolución del lenguaje, la necesidad de datos en diversos idiomas, etc.
* Ademas realiza un cuadro comparativo.

1.5 Métricas y Metodologías de Evaluación en la Literatura
* Describe cómo se mide el rendimiento de los modelos en los estudios revisados.
* Explica la importancia de las métricas adecuadas (Precision, Recall, F1-score, AUC) dado el problema del desbalance de clases. ¿Por qué Accuracy no es suficiente?
* Menciona si hay enfoques de evaluación estandarizados o comparativas comunes.

1.6 Desafíos Persistentes y Limitaciones de los Enfoques Existentes (El "Por Qué Aún No Está Resuelto")
* Esta sección es CRUCIAL para justificar tu propuesta.
* Sintetiza las limitaciones y dificultades que han enfrentado los investigadores a pesar de los avances técnicos.
* Revisa los desafíos ya mencionados en el punto anterior y amplía otros: la detección de sarcasmo/ironía, el discurso de odio implícito vs. explícito, la generalización a nuevos dominios/plataformas, los problemas de sesgo en los modelos, la explicabilidad de los resultados, los desafíos de implementación en tiempo real.
* Presenta estos desafíos como brechas en la investigación existente.

1.7 Tendencias Actuales y Direcciones Futuras (Enlace Directo a tu Propuesta)
* Basado en la revisión de los artículos más recientes y las discusiones en los "Future Work" de los autores, ¿hacia dónde se mueve el campo? (Ej: modelos multimodales, pocos-shot learning, detección proactiva, enfoques éticos).
* Identifica CLARAMENTE las áreas de investigación que AÚN NECESITAN TRABAJO y que están alineadas con lo que tú propondrás en el Capítulo 4. Este es el puente explícito entre el Estado del Arte y tu Propuesta. Puedes decir algo como: "A pesar de los avances, la revisión de la literatura revela que X, Y y Z siguen siendo desafíos abiertos, lo que justifica la necesidad de investigar enfoques como el propuesto en el Capítulo 4."

1.8 Conclusiones del Capítulo
* Resume brevemente los hallazgos clave de la revisión: la trayectoria del campo, las técnicas más destacadas, el estado actual, y reitera los principales desafíos y las oportunidades de investigación.
* Concluye indicando que el siguiente capítulo (Marco Teórico) proporcionará los fundamentos teóricos necesarios para comprender las bases de estos enfoques y la metodología a seguir. 

Ahora necesito que des una estructura para armar mi segundo capitulo el marco teorico, para sustentar el primer capitulo

---
