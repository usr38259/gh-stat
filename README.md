# gh-stat
Получение статистики посещений GitHub за последние 14 дней.  
**Платформа**: Termux, Rhino JavaScript

### Использование:
Скачать и установить `rhino1_7R2-dex.jar` (https://github.com/damonkohler/sl4a/blob/master/rhino/rhino_extras.zip)  
или выполнить команды:  
`curl https://github.com/damonkohler/sl4a/blob/master/rhino/rhino_extras.zip`  
`unzip -j rhino_extras.zip rhino/rhino1_7R2-dex.jar`  
`rm rhino_extras.zip`  
Создать js-файл командной строки, например `ghs_cmd.js`, следующего содержания:  
`args = ['user/repo', readFile ("token.txt"), '-cvpr']`  
`load ('ghstat.js')`, где
* `user` - имя пользователя;
* `repo` - название репозитория;
* `token.txt` - файл с содержимым ключа доступа;
* `-cprv` - требуемая статистика:
    - `c`: клонирования;
    - `v`: просмотры.
    - `p`: популярные страницы;
    - `r`: ссылающиеся сайты;

### Запуск
`cat ghs_cmd.js | dalvikvm -cp rhino1_7R2-dex.jar org.mozilla.javascript.tools.shell.Main`
