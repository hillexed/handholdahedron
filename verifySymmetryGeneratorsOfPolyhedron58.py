a=10;b=11
triangleFaceIndexDigits = [[0,1,4], [0,1,8], [0,2,3], [0,2,7], [0,3,6], [0,4,9], [0,5,6], [0,5,b], [0,7,a], [0,8,a], [0,9,b], [1,2,5], [1,2,6], [1,3,7], [1,3,9], [1,4,7], [1,5,a], [1,6,b], [1,8,b], [1,9,a], [2,3,b], [2,4,8], [2,4,a], [2,5,8], [2,6,9], [2,7,9], [2,a,b], [3,4,5], [3,4,b], [3,5,a], [3,6,7], [3,8,9], [3,8,a], [4,5,9], [4,6,a], [4,6,b], [4,7,8], [5,6,8], [5,7,9], [5,7,b], [6,7,a], [6,8,9], [7,8,b], [9,a,b]]
triangleFaceIndexDigits = [set(indices) for indices in triangleFaceIndexDigits]

symmetryGenerator1 = [[0,1,2],[3,4,5 ],[6,7,8 ],[9,a,b]];
symmetryGenerator2 = [[0,4 ],[1,9 ],[2,6 ],[3,a ],[5,8 ],[7,b]];
symmetryGenerator3 = [[0,7 ],[1,5 ],[2,a ],[3,6 ],[4,b ],[8,9]];

def generatorToMap(generatorInOrbitNotation):
    themap = {}
    for orbit in generatorInOrbitNotation:
        for i in range(len(orbit)):
            themap[orbit[i]] = orbit[(i+1) % len(orbit)]
    return themap

def verifyMapIsAGroupElement(amap, number='idk'):
    for dualplanes in triangleFaceIndexDigits:
        newpair = set([symmetryGenerator1Map[index] for index in dualplanes])
        if newpair not in triangleFaceIndexDigits:
            raise ValueError("Symmetry generator {} takes {} to {}, which isn't a vertex!".format(number, dualplanes, newpair))

symmetryGenerator1Map = generatorToMap(symmetryGenerator1)
verifyMapIsAGroupElement(symmetryGenerator1Map, 1)

symmetryGenerator2Map = generatorToMap(symmetryGenerator2)
verifyMapIsAGroupElement(symmetryGenerator2Map, 2)

symmetryGenerator3Map = generatorToMap(symmetryGenerator3)
verifyMapIsAGroupElement(symmetryGenerator3Map, 3)

print(symmetryGenerator1Map)


######

def printInPermutationForm(label, groupelement, end='\n'):
    if all([groupelement[index] == index for index in groupelement]):
        print(label,"= I", end='')
    else:
        print(label, end=' ')
        # turn 0:1, 1:0 into (0, 1)
        labels = list(groupelement.keys())
        labels.sort()
        
        while len(labels) > 0:
            permutation = []
            nextelem = labels[0]
            while(nextelem not in permutation):
                permutation.append(nextelem)
                nextelem = groupelement[nextelem]
                labels.remove(nextelem)

            print(tuple(permutation), end='')
    print('',end=end)

def compose(el1,el2):
    # assuming el1 and el2 are dicts {0:some other thing}
    # return el1(el2(x))
    return {index: el1[el2[index]] for index in el1}

R = symmetryGenerator1Map
B = symmetryGenerator2Map
C = symmetryGenerator3Map
printInPermutationForm("R", R)
printInPermutationForm("B", B)
printInPermutationForm("C", C)
print('--')

printInPermutationForm("R^2", compose(symmetryGenerator1Map, symmetryGenerator1Map))
printInPermutationForm("R^3", compose(compose(symmetryGenerator1Map, symmetryGenerator1Map), symmetryGenerator1Map))

printInPermutationForm("B^2", compose(symmetryGenerator2Map, symmetryGenerator2Map))

RB = compose(symmetryGenerator1Map, symmetryGenerator2Map)

RBPower = RB
for i in range(1,3):
    printInPermutationForm("(RB)^{}".format(i), RBPower)
    RBPower = compose(RBPower, RB)

print('--')

BR = compose(symmetryGenerator2Map, symmetryGenerator1Map)
printInPermutationForm("BR", BR)

BRPower = BR
for i in range(1,3):
    printInPermutationForm("(BR)^{}".format(i), BRPower)
    BRPower = compose(BRPower, BR)

RB != BR

printInPermutationForm("RBR", compose(RB, R))
printInPermutationForm("BRB", compose(BR, B))

print("--- investigation")
labeledGroupElements = [("R",R),("B",B),("I",compose(B,B)), ("C", C)]
newlyDiscoveredLabeledElements = []
for i in range(4):
    for label1, element1 in labeledGroupElements:
        for label2, element2 in labeledGroupElements:
            newLabel = label1 + label2
            newElement = compose(element1, element2)

            alreadyFound = False
            for label, elem in labeledGroupElements:
                if elem == newElement:
                    alreadyFound = True
                    print(newLabel, "already known, equal to", label)

            for label, elem in newlyDiscoveredLabeledElements:
                if elem == newElement:
                    alreadyFound = True
                

            if not alreadyFound:
                newlyDiscoveredLabeledElements.append((newLabel, newElement))

    for label, elem in newlyDiscoveredLabeledElements:   
        printInPermutationForm("Discovered {}".format(label), elem) 
        labeledGroupElements.append((label, elem))

    newlyDiscoveredLabeledElements = []
    print([label for label, elem in labeledGroupElements])
    print("end of round",i)

print("Looks like we got a symmetry group of order {}".format(len(labeledGroupElements)))
