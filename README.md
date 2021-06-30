# 计划和说明

FVTT里面主要就是两类物件：Actor和Item。

现阶段只考虑把自动卡的部分搞定，那些自动检定的功能暂时放一放。

## Actor

Actor就是角色。

### 模板

Actor模板只有一个：Common。

common模板里面有所有Actor对象都应该有的信息。具体的内容待设计。

### 类型

Actor下面有三个类型：

+ Character：玩家角色；
+ Companion：友伴；
+ NPC：非玩家角色；

## Item

Item就是抽象意义上的物件。

### 模板

Item具有以下的模板：

+ itemDescription：具有此模板的物件具有物品描述；
+ physicalItem：具有此模板的物件是物理上实在的物品，具有硬度、生命值等一系列的特性；
+ itemLevel：具有此模板的物品有物品等级一类的东西；
+ activatedEffect：暂时用不上，以后考虑自动检定的时候再说；
+ magicItem：只有一个成员：是否已知用途；
+ status：具有此模板的物件是某种状态，暂时用不上，现阶段不做状态类的东西。

### 类型

Item具有以下类型：

+ skill：技能；
+ weapon：武器；
+ armor：护甲；
+ equipment：其他穿戴品；
+ consumable：消耗品；
+ treasure：其他物品；
+ spell：法术；
+ ancestry：族裔力量；
+ feat：专长；
+ activity：行动；
+ backpack：背包；
+ condition：状态，暂时不管；
+ effect：效果，暂时不管；
+ talent：天赋；
+ soulment：魂能；
+ package：能力组（流派、领域、宗派）；
+ tradition：源流。