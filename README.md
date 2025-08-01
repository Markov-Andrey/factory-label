# Сервис Шаблонизатор этикеток

# Info

## Стек
- Laravel
- Vue Js 3
- Tailwind + Flowbite
- Fabric Js

## Роуты и возможности страниц

`/?page=<num>>&tag=<tag>&name=<title>` - страница предпросмотра шаблонов с пагинацией.

Возможности: 
- поиск по 1 тегу
- поиск по названию
- создать новый шаблон
- переименовать выбранный шаблон
- создать копию выбранного шаблона
- перейти в режим редактирования
- удалить выбранный шаблон
- поддержка хоткеев (указаны в скобках) - регистро- и раскладка- независимы

`/editor/<index>` - страница редактирования шаблона

__Right Bar:__
- __Размеры шаблона__ - ширина, высота указыватеся в мм
- __Слои__ - отображает порядок слоев, позволяет изменять порядок, изменять видимость и блокировать слой
- __Карта ключей__ - образец json шаблона для заполнения на основе введенных id слоёв, возможность скопировать образец
- __Текущий объект__ - изменить ID объекта (__поля исп для заполнения json__), изм. положение X/Y и угол, получить "голое" инфо объекта

__Left Bar:__
- __Сохранить (CTRL+S)__ - сохранить шаблон, обновить превью
- __Выйти__ - завершить работу с шаблоном без сохранения
- __Отменить (CTRL+Z)__ - отменить поледнее изменение при редактировании
- __Вернуть (CTRL+Y)__ - вернуть изменения вверх по истории, head истории перезаписывается в момент внесения новых изменений
- __Добавить текст__ - вставить textarea (настраивается ширина блока, по высоте заполняется автоматически)
- __Добавить рамку__ - вставить прямоугольник с пустым содержимым
- __Добавить QR__ - вставить из списка 1 из видов QR (Datamatrix, QR, Barcode)
- __Добавить символ__ - вставить из списка 1 из видов символов (Знаки соответствия, Манипуляционные знаки, Экологические знаки, Другие)
- __Добавить изображение__ - вставить изображение из файла

__Top Bar (только для выбранного текста):__
- __Шрифт текста__ - изменить шрифт текста из списка
- __Размер шрифта__ - изменить размер шрифта
- __Межстрочный интервал__ - изменить размер интервала между строк
- __Полужирный (CTRL+B)__ - добавить/удалить полужирное начертание текста
- __Курсив (CTRL+I)__ - добавить/удалить курсивное начертание текста
- __Текст по левому краю (CTRL+L)__ - текст прижимается к левому краю textarea
- __Текст по левому краю (CTRL+E)__ - текст центрируется по середине textarea
- __Текст по правому краю (CTRL+R)__ - текст прижимается к правому краю textarea
- __Текст по ширине (CTRL+J)__ - текст растягивается на ширину textarea
- __Фон текста__ - выбрать цвет фона textarea, установить его прозрачность
- __Цвет текста__ - выбрать цвет текста, установить его прозрачность
- __Очистить стили (CTRL+Space)__ - очистить кастомные стили текста (в случае копирования текста из иного источника) (`св-во объекта styles = []`)

`/templates/<index>` - загрузка, валидаци и предпросмотр json в шаблон для генерации архива этикеток на печать

Возможности:
- загрузка с ПК подготовленного json (__на основе требуемых ID полей шаблона__)
- валидация (без блокировки дальнейшей обработки) - серым цветом выделены ключи шаблона, которые должны быть в json. По первому объекту из json подсвечивается зеленым цветом поля которые соответствуют шаблон, красным цветом выделены полня которые не найдены в загруженном json
- предпросмотр 1-го объекта из загруженного json, выполняется автоматически при загрузке файла json
- обработать - отправить полный json на сервер в обработку, процесс выполнения отображается в окне, по id ( держать соединение не обязательно), при выполнении работы будет отдана ссылка на архив со всеми сгенерированными этикетками

# DEV

## Особенности
- Canvas-слой от либы Factory Js не является реактивным, поэтому компонент LabelEditor.vue такой "костыльный", с привязкой множества js для разгрузки основного компонента
- В центре обработки из Json шаблона в картинку на стороне бэка - node.js скрипт (api/node_scripts/generate_image.js), выполняется в цикле через php

## Старт dev-разработки
`start-dev.bat` - запускает фронт и бэк сервера разработки
`test.json` - образец шаблона для обработки тестового шаблона

## Крон-команды
`php artisan app:process-job` (everyMinute) - запустить процесс обработки очереди (не запускается если работа ещё идет)
`php artisan app:clear-tmp` (dailyAt('00:10')) - очистить tmp (удаляет предпросмотры 1-о элемента при заполнении шаблона, а также очистка архивов с завершенной работой)

## Импорт таблиц

CREATE SEQUENCE LABELER_TEMPLATES_SEQ START WITH 1 INCREMENT BY 1 NOCACHE;

CREATE TABLE LABELER_TEMPLATES (
ID NUMBER PRIMARY KEY,
NAME VARCHAR2(255) NOT NULL,
PREVIEW_PATH VARCHAR2(512),
TAGS VARCHAR2(1000),
TEMPLATE CLOB,
CREATED_AT TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
UPDATED_AT TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE OR REPLACE TRIGGER LABELER_TEMPLATES_TRIGGER
BEFORE INSERT OR UPDATE ON LABELER_TEMPLATES
FOR EACH ROW
BEGIN
IF INSERTING THEN
IF :NEW.ID IS NULL THEN
SELECT LABELER_TEMPLATES_SEQ.NEXTVAL INTO :NEW.ID FROM DUAL;
END IF;
IF :NEW.CREATED_AT IS NULL THEN
:NEW.CREATED_AT := SYSTIMESTAMP;
END IF;
:NEW.UPDATED_AT := SYSTIMESTAMP;
ELSIF UPDATING THEN
:NEW.UPDATED_AT := SYSTIMESTAMP;
END IF;
END;
/

__________________
CREATE TABLE LABELER_JOBS (
ID               NUMBER PRIMARY KEY,
DATA             CLOB NOT NULL,
STATUS           VARCHAR2(20 CHAR) DEFAULT 'queued' NOT NULL,
RECORDS_TOTAL   NUMBER DEFAULT 0 NOT NULL,
RECORDS_DONE    NUMBER DEFAULT 0 NOT NULL,
RESULT_ZIP_PATH  VARCHAR2(500 CHAR),
ERROR_MESSAGE    CLOB,
CREATED_AT       DATE DEFAULT SYSDATE NOT NULL,
UPDATED_AT       DATE
);

CREATE SEQUENCE LABELER_JOBS_SEQ START WITH 1 INCREMENT BY 1 NOCACHE;

CREATE OR REPLACE TRIGGER LABELER_JOBS_TRIGGER
BEFORE INSERT OR UPDATE ON LABELER_JOBS
FOR EACH ROW
BEGIN
IF INSERTING THEN
IF :NEW.ID IS NULL THEN
SELECT LABELER_JOBS_SEQ.NEXTVAL INTO :NEW.ID FROM DUAL;
END IF;
IF :NEW.CREATED_AT IS NULL THEN
:NEW.CREATED_AT := SYSTIMESTAMP;
END IF;
:NEW.UPDATED_AT := SYSTIMESTAMP;
ELSIF UPDATING THEN
:NEW.UPDATED_AT := SYSTIMESTAMP;
END IF;
END;
/

ALTER TABLE LABELER_JOBS
ADD TEMPLATE_ID NUMBER;