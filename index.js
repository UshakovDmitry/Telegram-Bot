const { Telegraf, Markup } = require('telegraf');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);

const categories = {
    'household': {
        label: 'Хоз.товары',
        items: {
            'broom': 'Веник',
            'bleach': 'Белизна',
            'paper_towel': 'Бумажное полотенце',
            'bucket': 'Ведро пластмасс. 10л',
            'sponge': 'Губка для посуды',
            'liquid_soap': 'Жидкое мыло',
            'lazybones': 'Лентяйка',
            'microfiber': 'Микрофибра',
            'bar_soap': 'Мыло хозяйственное',
            'air_freshener': 'Освежитель воздуха',
            'trash_bag': 'Пакет для мусора',
            'cotton_gloves': 'Перчатки Х/Б',
            'cleaning_powder': 'Порошок чистящий',
            'napkins': 'Салфетки',
            'triggers': 'Тригеры',
            'toilet_paper': 'Туалетная бумага',
            'brush': 'Щетка',
            'rags': 'Ветошь',
            'glass_cleaner': 'Средство для мытья стекол',
            'dishwashing_liquid': 'Средство для мытья посуды',
            'floor_cleaner': 'Средство для мытья полов'
        }
    },
    'office': {
        label: 'Канц.товары',
        items: {
            'notepad': 'Блокнот для записей',
            'paper': 'Бумага для записей',
            'scissors': 'Ножницы',
            'antistapler': 'Антистеплер',
            'hole_punch': 'Дырокол',
            'liquid': 'Жидкость',
            'paper_clip': 'Зажим для бумаги',
            'spare_blade': 'Запасное лезвие',
            'calculator': 'Калькулятор',
            'glue': 'Клей канцелярский',
            'account_book': 'Книга учета',
            'paper_bin': 'Корзина для бумаг',
            'eraser': 'Ластик',
            'ruler': 'Линейка',
            'marker': 'Маркер',
            'black_marker': 'Маркер черный',
            'marker_set': 'Набор маркеров',
            'thread': 'Нить',
            'office_knife': 'Нож канцелярский',
            'organizer': 'Органайзер',
            'clipboard': 'Папка планшет',
            'divider': 'Разделитель',
            'pen': 'Ручка',
            'staples': 'Скобы',
            'clips': 'Скрепки',
            'folder': 'Папка регистратор'
        }
    }
};

async function safeEditMessageText(ctx, newText, markup) {
    if (ctx.update.callback_query.message.text !== newText) {
        await ctx.editMessageText(newText, markup);
    }
}

bot.start((ctx) => {
    ctx.reply('Добро пожаловать!', Markup.inlineKeyboard([
        [Markup.button.callback('Начать', 'start')]
    ]));
});

bot.action('start', (ctx) => {
    const categoryButtons = Object.keys(categories).map(catKey => [Markup.button.callback(categories[catKey].label, catKey)]);
    categoryButtons.push([Markup.button.callback('Поиск', 'initiate_search')]);
    safeEditMessageText(ctx, 'Выберите категорию или начните поиск:', Markup.inlineKeyboard(categoryButtons));
});

bot.action('initiate_search', (ctx) => {
    safeEditMessageText(ctx, 'Введите название товара, который вы хотите найти:');
});

bot.on('text', (ctx) => {
    const searchText = ctx.message.text.toLowerCase();
    const foundItems = [];

    Object.keys(categories).forEach(catKey => {
        Object.keys(categories[catKey].items).forEach(itemKey => {
            if (categories[catKey].items[itemKey].toLowerCase().includes(searchText)) {
                foundItems.push([Markup.button.callback(categories[catKey].items[itemKey], itemKey)]);
            }
        });
    });

    if (foundItems.length) {
        ctx.reply('Вот что мы нашли:', Markup.inlineKeyboard(foundItems));
    } else {
        ctx.reply('К сожалению, по вашему запросу ничего не найдено. Попробуйте другое название товара.');
    }
});

Object.keys(categories).forEach(catKey => {
    bot.action(catKey, (ctx) => {
        const itemButtons = Object.keys(categories[catKey].items).map(itemKey => [Markup.button.callback(categories[catKey].items[itemKey], itemKey)]);
        safeEditMessageText(ctx, `Выберите товар из категории ${categories[catKey].label}:`, Markup.inlineKeyboard(itemButtons));
    });

    Object.keys(categories[catKey].items).forEach(itemKey => {
        bot.action(itemKey, (ctx) => {
            safeEditMessageText(ctx, `Заявка на получение "${categories[catKey].items[itemKey]}" отправлена!`);
        });
    });
});

bot.action('search', (ctx) => {
    safeEditMessageText(ctx, 'Функция поиска пока не реализована.');
});

bot.help((ctx) => ctx.reply('Отправьте /start для начала работы с ботом'));

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));